package com.evgenltd.financemanager.user

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.testsupport.ApiResponse
import com.evgenltd.financemanager.user.component.withTenant
import com.evgenltd.financemanager.user.config.SecurityConfig
import com.evgenltd.financemanager.user.entity.UserRole
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.JwsHeader
import org.springframework.security.oauth2.jwt.JwtClaimsSet
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.JwtEncoderParameters
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

/**
 * Phase 4: multi-tenant isolation + JWT rejection paths. The async-propagation piece of Phase 4
 * lives separately in AsyncTenantPropagationIntegrationTest.
 */
class SecurityIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var jwtEncoder: JwtEncoder

    private val otherTenant: UUID = UUID.fromString("00000000-0000-0000-0000-000000000004")

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        withTenant(otherTenant) { accountRepository.deleteAll() }
    }

    @Test
    fun `list - accounts created under one tenant are invisible to another tenant`() {
        withTenant { accountRepository.save(Account(name = "Tenant A Bank", type = AccountType.ACCOUNT)) }
        withTenant(otherTenant) { accountRepository.save(Account(name = "Tenant B Bank", type = AccountType.ACCOUNT)) }

        val asTenantA = restClient.get()
            .uri("/api/v1/account")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<AccountRecord>>>() {})

        val asTenantB = restClient.get()
            .uri("/api/v1/account")
            .headers { it.addAll(headersFor(otherTenant)) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<AccountRecord>>>() {})

        assertThat(asTenantA!!.body).extracting("name").containsExactly("Tenant A Bank")
        assertThat(asTenantB!!.body).extracting("name").containsExactly("Tenant B Bank")
    }

    @Test
    fun `byId - a record from another tenant is not found, not leaked`() {
        val tenantAAccount = withTenant { accountRepository.save(Account(name = "Tenant A Bank", type = AccountType.ACCOUNT)) }

        val response = restClient.get()
            .uri("/api/v1/account/${tenantAAccount.id}")
            .headers { it.addAll(headersFor(otherTenant)) }
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode.is4xxClientError).isTrue()
    }

    @Test
    fun `an expired access token is rejected`() {
        val expired = mintToken(tenant = TEST_TENANT, expiresAt = Instant.now().minus(1, ChronoUnit.MINUTES))

        val response = restClient.get()
            .uri("/api/v1/account")
            .headers { headers ->
                headers.setBearerAuth(expired)
                headers.contentType = MediaType.APPLICATION_JSON
            }
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode.is4xxClientError).isTrue()
    }

    @Test
    fun `a token with a tampered signature is rejected`() {
        val valid = authHeaders().getFirst(HttpHeaders.AUTHORIZATION)!!.removePrefix("Bearer ")
        val tamperedSignature = valid.dropLast(4) + "AAAA"

        val response = restClient.get()
            .uri("/api/v1/account")
            .headers { headers ->
                headers.setBearerAuth(tamperedSignature)
                headers.contentType = MediaType.APPLICATION_JSON
            }
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode.is4xxClientError).isTrue()
    }

    private fun headersFor(tenant: UUID): HttpHeaders = HttpHeaders().apply {
        setBearerAuth(mintToken(tenant, Instant.now().plus(15, ChronoUnit.MINUTES)))
        contentType = MediaType.APPLICATION_JSON
    }

    private fun mintToken(tenant: UUID, expiresAt: Instant): String {
        // NimbusJwtEncoder requires expiresAt > issuedAt even for an intentionally-expired token,
        // so issuedAt must be relative to expiresAt rather than a fixed Instant.now().
        val claims = JwtClaimsSet.builder()
            .issuedAt(expiresAt.minus(1, ChronoUnit.MINUTES))
            .subject("security-test-user")
            .expiresAt(expiresAt)
            .claim("userId", UUID.randomUUID())
            .claim("authorities", UserRole.USER)
            .claim(SecurityConfig.TENANT, tenant)
            .build()
        val header = JwsHeader.with(SecurityConfig.ALGORITHM).build()
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).tokenValue
    }
}

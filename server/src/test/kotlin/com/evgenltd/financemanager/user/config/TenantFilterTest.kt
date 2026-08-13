package com.evgenltd.financemanager.user.config

import com.evgenltd.financemanager.user.component.currentTenant
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.springframework.security.authentication.TestingAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import java.time.Instant
import java.util.UUID

class TenantFilterTest {

    private val filter = TenantFilter()
    private val request = mock<HttpServletRequest>()
    private val response = mock<HttpServletResponse>()

    @AfterEach
    fun clearSecurityContext() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `doFilterInternal - sets the tenant from the JWT tenant claim for the duration of the chain`() {
        val tenant = UUID.randomUUID()
        SecurityContextHolder.getContext().authentication = TestingAuthenticationToken(jwtWithTenant(tenant), null)
        var tenantSeenByChain: UUID? = null
        val chain = FilterChain { _, _ -> tenantSeenByChain = currentTenant() }

        filter.doFilter(request, response, chain)

        assertThat(tenantSeenByChain).isEqualTo(tenant)
        assertThat(currentTenant()).isNull() // restored after the chain completes
    }

    @Test
    fun `doFilterInternal - no authentication means no tenant is set`() {
        var tenantSeenByChain: UUID? = UUID.randomUUID() // sentinel to prove it gets overwritten with null
        val chain = FilterChain { _, _ -> tenantSeenByChain = currentTenant() }

        filter.doFilter(request, response, chain)

        assertThat(tenantSeenByChain).isNull()
    }

    private fun jwtWithTenant(tenant: UUID): Jwt = Jwt.withTokenValue("token")
        .header("alg", "none")
        .claim(SecurityConfig.TENANT, tenant.toString())
        .issuedAt(Instant.now())
        .expiresAt(Instant.now().plusSeconds(60))
        .build()
}

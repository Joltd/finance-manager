package com.evgenltd.financemanager.user.service

import com.evgenltd.financemanager.user.component.TenantResolver
import com.evgenltd.financemanager.user.config.SecurityConfig
import com.evgenltd.financemanager.user.config.SecurityProperties
import com.evgenltd.financemanager.user.entity.UserRole
import org.springframework.security.oauth2.jwt.JwsHeader
import org.springframework.security.oauth2.jwt.JwtClaimsSet
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.JwtEncoderParameters
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
class TokenProvider(
    private val properties: SecurityProperties,
    private val encoder: JwtEncoder,
) {

    fun createAccessToken(id: UUID, login: String, role: UserRole, tenant: UUID): String = createToken {
        val expiresAt = Instant.now()
            .plus(properties.accessTokenExpirationMinutes, ChronoUnit.MINUTES)
        it.subject(login)
        it.expiresAt(expiresAt)
        it.claim("userId", id)
        it.claim("authorities", role)
        it.claim(SecurityConfig.TENANT, tenant)
    }

    fun createRefreshToken(id: UUID, login: String): String = createToken {
        val expiresAt = Instant.now()
            .plus(properties.refreshTokenExpirationMinutes, ChronoUnit.MINUTES)
        it.subject(login)
        it.expiresAt(expiresAt)
        it.claim("userId", id)
    }

    private fun createToken(block: (JwtClaimsSet.Builder) -> Unit): String {
        val claims = JwtClaimsSet.builder()
            .issuedAt(Instant.now())
            .also { block(it) }
            .build()
        val header = JwsHeader.with(SecurityConfig.ALGORITHM).build()
        val parameters = JwtEncoderParameters.from(header, claims)

        return encoder.encode(parameters).tokenValue
    }
}
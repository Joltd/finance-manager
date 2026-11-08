package com.evgenltd.financemanager.user.service

import com.evgenltd.financemanager.user.config.SecurityConfig
import com.evgenltd.financemanager.user.config.SecurityProperties
import com.evgenltd.financemanager.user.config.TokenType
import com.evgenltd.financemanager.user.entity.UserRole
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.security.oauth2.jwt.JwtException
import java.util.UUID

class TokenProviderTest {

    private val properties = SecurityProperties(
        // base64 of 64 bytes - the minimum key size for HS512
        secret = "VGVzdFNlY3JldEtleUZvckludGVncmF0aW9uMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMA==",
        accessTokenExpirationMinutes = 15,
        refreshTokenExpirationMinutes = 43200,
    )
    private val securityConfig = SecurityConfig(properties)
    private val accessTokenDecoder = securityConfig.accessTokenDecoder()
    private val tokenProvider = TokenProvider(
        properties,
        securityConfig.jwtEncoder(),
        securityConfig.refreshTokenDecoder(),
    )

    private val userId = UUID.fromString("00000000-0000-0000-0000-000000000002")
    private val tenant = UUID.fromString("00000000-0000-0000-0000-000000000001")

    @Test
    fun `access token - is accepted by the resource server decoder`() {
        val token = tokenProvider.createAccessToken(userId, "user", UserRole.USER, tenant)

        val jwt = accessTokenDecoder.decode(token)

        assertThat(jwt.subject).isEqualTo("user")
        assertThat(jwt.getClaimAsString(TokenType.CLAIM)).isEqualTo(TokenType.ACCESS.claimValue)
    }

    @Test
    fun `access token - is rejected as a refresh token`() {
        val token = tokenProvider.createAccessToken(userId, "user", UserRole.USER, tenant)

        assertThatThrownBy { tokenProvider.parseRefreshToken(token) }.isInstanceOf(JwtException::class.java)
    }

    @Test
    fun `refresh token - is parsed as a refresh token`() {
        val token = tokenProvider.createRefreshToken(userId, "user")

        val jwt = tokenProvider.parseRefreshToken(token)

        assertThat(jwt.subject).isEqualTo("user")
        assertThat(jwt.getClaimAsString(TokenType.CLAIM)).isEqualTo(TokenType.REFRESH.claimValue)
    }

    @Test
    fun `refresh token - is rejected by the resource server decoder`() {
        val token = tokenProvider.createRefreshToken(userId, "user")

        assertThatThrownBy { accessTokenDecoder.decode(token) }.isInstanceOf(JwtException::class.java)
    }

    @Test
    fun `refresh token - expires after the configured refresh lifetime`() {
        val jwt = tokenProvider.parseRefreshToken(tokenProvider.createRefreshToken(userId, "user"))

        val lifetimeMinutes = java.time.Duration.between(jwt.issuedAt, jwt.expiresAt).toMinutes()
        assertThat(lifetimeMinutes).isEqualTo(properties.refreshTokenExpirationMinutes)
    }
}

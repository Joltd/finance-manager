package com.evgenltd.financemanager.user.config

import com.nimbusds.jose.jwk.source.ImmutableSecret
import com.nimbusds.jose.util.Base64
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.factory.PasswordEncoderFactories
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.JwtClaimValidator
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.JwtValidators
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import javax.crypto.spec.SecretKeySpec

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfig(
    private val properties: SecurityProperties
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain = http
        .csrf { it.disable() }
        .cors { it.configurationSource(corsConfigurationSource()) }
        .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
        .httpBasic { it.disable() }
        .formLogin { it.disable() }
        .authorizeHttpRequests {
            it.requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
        }
        .oauth2ResourceServer { resourceServer ->
            resourceServer.jwt { jwt ->
                jwt.decoder(accessTokenDecoder())
                jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())
            }.bearerTokenResolver(bearerTokenResolver())
        }
        .addFilterAfter(TenantFilter(), BearerTokenAuthenticationFilter::class.java)
        .addFilterAfter(MdcFilter(), TenantFilter::class.java)
        .build()

    private fun corsConfigurationSource(): UrlBasedCorsConfigurationSource {
        val config = CorsConfiguration()
        config.allowedMethods = listOf("HEAD", "GET", "POST", "PUT", "DELETE", "OPTIONS")
        config.addAllowedOrigin("*")
        config.addAllowedHeader("*")
        config.addAllowedMethod("*")
        config.maxAge = 3600
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/api/**", config)
        source.registerCorsConfiguration("/sse", config)
        source.registerCorsConfiguration("/management/**", config)
        source.registerCorsConfiguration("/v3/api-docs", config)
        source.registerCorsConfiguration("/swagger-ui/**", config)
        return source
    }

    private fun jwtAuthenticationConverter(): JwtAuthenticationConverter {
        val jwtGrantedAuthoritiesConverter = JwtGrantedAuthoritiesConverter().also {
            it.setAuthoritiesClaimName("authorities")
            it.setAuthorityPrefix("ROLE_")
        }
        return JwtAuthenticationConverter()
            .apply {
                setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter)
            }
    }

    private fun bearerTokenResolver(): BearerTokenResolver {
        val uriResolver = DefaultBearerTokenResolver().also { it.setAllowUriQueryParameter(true) }
        val defaultResolver = DefaultBearerTokenResolver()

        return BearerTokenResolver {
            if (it.requestURI.startsWith("/sse")) {
                uriResolver.resolve(it)
            } else {
                defaultResolver.resolve(it)
            }
        }
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder()

    @Bean
    fun authenticationManager(authConfig: AuthenticationConfiguration): AuthenticationManager = authConfig.authenticationManager

    @Bean
    fun authenticationProvider(passwordEncoder: PasswordEncoder, userDetailsService: UserDetailsService): DaoAuthenticationProvider {
        val provider = DaoAuthenticationProvider(userDetailsService)
        provider.setPasswordEncoder(passwordEncoder)
        return provider
    }

    @Bean
    fun jwtEncoder(): JwtEncoder = NimbusJwtEncoder(ImmutableSecret(secretKey()))

    /**
     * Authenticates Bearer requests in the resource server. Primary, so an unqualified
     * JwtDecoder injection gets the decoder that guards the API.
     */
    @Bean
    @Primary
    fun accessTokenDecoder(): JwtDecoder = jwtDecoder(TokenType.ACCESS)

    /** Verifies refresh tokens on `/api/public/v1/user/auth/refresh`. */
    @Bean(REFRESH_TOKEN_DECODER)
    fun refreshTokenDecoder(): JwtDecoder = jwtDecoder(TokenType.REFRESH)

    /** Checks signature and expiration, and accepts only tokens of the given [tokenType]. */
    private fun jwtDecoder(tokenType: TokenType): JwtDecoder = NimbusJwtDecoder
        .withSecretKey(secretKey())
        .macAlgorithm(ALGORITHM)
        .build()
        .also {
            it.setJwtValidator(
                DelegatingOAuth2TokenValidator(
                    JwtValidators.createDefault(),
                    JwtClaimValidator<String>(TokenType.CLAIM) { claim -> claim == tokenType.claimValue },
                )
            )
        }

    private fun secretKey(): SecretKeySpec {
        val key = Base64.from(properties.secret).decode()
        return SecretKeySpec(key, ALGORITHM.name)
    }

    companion object {
        val ALGORITHM = MacAlgorithm.HS512
        const val TENANT = "tenant"
        const val REFRESH_TOKEN_DECODER = "refreshTokenDecoder"
    }

}
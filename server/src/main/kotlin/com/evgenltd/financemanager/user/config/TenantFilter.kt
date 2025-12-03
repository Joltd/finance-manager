package com.evgenltd.financemanager.user.config

import com.evgenltd.financemanager.user.component.withTenant
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

class TenantFilter : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val principal = SecurityContextHolder.getContext()
            .authentication
            ?.principal as? Jwt

        val tenant = principal
            ?.getClaimAsString(SecurityConfig.TENANT)
            ?.let { UUID.fromString(it) }

        withTenant(tenant) {
            filterChain.doFilter(request, response)
        }
    }
}
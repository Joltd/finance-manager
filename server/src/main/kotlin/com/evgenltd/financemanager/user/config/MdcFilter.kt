package com.evgenltd.financemanager.user.config

import com.evgenltd.financemanager.user.component.currentTenant
import com.evgenltd.financemanager.user.component.withMdc
import com.evgenltd.financemanager.user.service.currentUser
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

class MdcFilter : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val requestId = request.getHeader(REQUEST_ID_HEADER) ?: UUID.randomUUID().toString()
        response.setHeader(REQUEST_ID_HEADER, requestId)

        withMdc(requestId, currentTenant(), currentUser()) {
            filterChain.doFilter(request, response)
        }
    }

    companion object {
        const val REQUEST_ID_HEADER = "X-Request-ID"
    }
}

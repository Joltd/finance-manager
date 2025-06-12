package com.evgenltd.financemanager.common.util

import org.springframework.core.MethodParameter
import org.springframework.core.io.Resource
import org.springframework.http.MediaType
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice

@RestControllerAdvice
class ApplicationResponseHandler : ResponseBodyAdvice<Any>, Loggable() {

    override fun supports(
        returnType: MethodParameter,
        converterType: Class<out HttpMessageConverter<*>>
    ): Boolean {
        return true
    }

    override fun beforeBodyWrite(
        body: Any?,
        returnType: MethodParameter,
        selectedContentType: MediaType,
        selectedConverterType: Class<out HttpMessageConverter<*>>,
        request: ServerHttpRequest,
        response: ServerHttpResponse
    ): Any? = if (request.uri.toString() in EXCLUSIONS || body is Response || body is Resource) {
        body
    } else {
        Response(true, body, null)
    }

    @ExceptionHandler(Throwable::class)
    fun handle(throwable: Throwable?): Any? {
        log.error("", throwable)
        return Response(false, null, throwable?.message ?: "Server error")
    }

    data class Response(val success: Boolean, val body: Any?, val error: String?)

    private companion object {
        val EXCLUSIONS = listOf(
            "/actuator",
            "/sse"
        )
    }

}

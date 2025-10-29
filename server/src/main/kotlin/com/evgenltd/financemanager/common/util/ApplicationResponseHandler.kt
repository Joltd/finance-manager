package com.evgenltd.financemanager.common.util

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.controller.SseController
import com.evgenltd.financemanager.common.record.Response
import jakarta.servlet.http.HttpServletResponse
import org.springframework.core.MethodParameter
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.security.authorization.AuthorizationDeniedException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.HandlerMethod
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice

@RestControllerAdvice
class ApplicationResponseHandler : ResponseBodyAdvice<Any>, Loggable() {

    override fun supports(
        returnType: MethodParameter,
        converterType: Class<out HttpMessageConverter<*>>
    ): Boolean = returnType.hasMethodAnnotation(DataResponse::class.java)
            || returnType.declaringClass.isAnnotationPresent(DataResponse::class.java)

    override fun beforeBodyWrite(
        body: Any?,
        returnType: MethodParameter,
        selectedContentType: MediaType,
        selectedConverterType: Class<out HttpMessageConverter<*>>,
        request: ServerHttpRequest,
        response: ServerHttpResponse
    ): Any = Response(true, body, null)

    @ExceptionHandler(ResponseStatusException::class)
    fun handle(exception: ResponseStatusException): ResponseEntity<Response> = ResponseEntity.status(exception.statusCode)
        .body(Response(false, null, exception.reason))

    @ExceptionHandler(Exception::class)
    fun handle(exception: Exception, response: HttpServletResponse): ResponseEntity<Response> {
        log.error("Unhandled exception", exception)
        val status = HttpStatusCode.valueOf(response.status)
            .takeIf { it != HttpStatus.OK }
            ?: HttpStatus.INTERNAL_SERVER_ERROR
        return ResponseEntity.status(status)
            .body(Response(false, null, exception.message))
    }

}

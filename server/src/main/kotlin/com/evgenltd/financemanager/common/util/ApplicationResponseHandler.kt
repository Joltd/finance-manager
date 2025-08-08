package com.evgenltd.financemanager.common.util

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.controller.SseController
import com.evgenltd.financemanager.common.record.Response
import org.springframework.core.MethodParameter
import org.springframework.http.MediaType
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.HandlerMethod
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
    ): Any? = Response(true, body, null)

    @ExceptionHandler(Exception::class)
    fun handle(exception: Exception, method: HandlerMethod?): Any? {
        if (method?.bean is SseController) {
            return null
        }
        log.error("Unhandled exception", exception)
        return Response(false, null, exception.message ?: "Server error")
    }

}

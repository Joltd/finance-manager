package com.evgenltd.financemanager.common.component

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpRequest
import org.springframework.http.client.*
import org.springframework.stereotype.Component
import org.springframework.web.client.ResponseErrorHandler
import org.springframework.web.client.RestTemplate

@Component
class IntegrationRestTemplate : RestTemplate() {

    val log: Logger = LoggerFactory.getLogger(IntegrationRestTemplate::class.java)

    init {
        requestFactory = BufferingClientHttpRequestFactory(SimpleClientHttpRequestFactory())

        errorHandler = object : ResponseErrorHandler {
            override fun hasError(response: ClientHttpResponse): Boolean = false

            override fun handleError(response: ClientHttpResponse) {}
        }

        interceptors = listOf(object : ClientHttpRequestInterceptor {
            override fun intercept(
                request: HttpRequest,
                body: ByteArray,
                execution: ClientHttpRequestExecution
            ): ClientHttpResponse {
                log.info("REQUEST ${request.method} ${request.uri} body ${String(body)}")
                val response = execution.execute(request, body)
//                val responseBody = response.body.bufferedReader().use { it.readText() }
                val responseBody = response.body.readAllBytes()
                log.info("RESPONSE ${response.statusCode} ${response.headers} body $responseBody")
                return response
            }
        })
    }

}
package com.evgenltd.financemanager.common.util

import org.springframework.http.HttpRequest
import org.springframework.http.client.ClientHttpRequestExecution
import org.springframework.http.client.ClientHttpRequestInterceptor
import org.springframework.http.client.ClientHttpResponse
import org.springframework.stereotype.Component
import java.io.BufferedReader
import java.io.InputStreamReader
import java.nio.charset.StandardCharsets
import java.util.stream.Collectors

@Component
class RestLoggingInterceptor : ClientHttpRequestInterceptor, Loggable() {

    override fun intercept(
        request: HttpRequest,
        body: ByteArray,
        execution: ClientHttpRequestExecution
    ): ClientHttpResponse {
        log.debug("Request url: {}", request.uri)
        log.debug("Request body: {}", String(body, StandardCharsets.UTF_8))

        val response: ClientHttpResponse = execution.execute(request, body)

        val stream = InputStreamReader(response.body, StandardCharsets.UTF_8)
        val responseBody: String = BufferedReader(stream).lines()
            .collect(Collectors.joining("\n"))
        log.debug("Response body: {}", responseBody)

        return response
    }

}

package com.evgenltd.financemanager.common.component

import org.slf4j.LoggerFactory
import org.springframework.http.HttpRequest
import org.springframework.http.HttpStatusCode
import org.springframework.http.client.BufferingClientHttpRequestFactory
import org.springframework.http.client.ClientHttpRequestExecution
import org.springframework.http.client.ClientHttpRequestInterceptor
import org.springframework.http.client.ClientHttpResponse
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

@Component
class IntegrationRestClient : RestClient by build() {

    companion object {
        private val log = LoggerFactory.getLogger(IntegrationRestClient::class.java)

        private fun build(): RestClient = RestClient.builder()
            .requestFactory(BufferingClientHttpRequestFactory(SimpleClientHttpRequestFactory()))
            .requestInterceptor(object : ClientHttpRequestInterceptor {
                override fun intercept(
                    request: HttpRequest,
                    body: ByteArray,
                    execution: ClientHttpRequestExecution,
                ): ClientHttpResponse {
                    log.info("REQUEST ${request.method} ${request.uri} body ${String(body)}")
                    val response = execution.execute(request, body)
                    val responseBody = response.body.readAllBytes()
                    log.info("RESPONSE ${response.statusCode} ${response.headers} body $responseBody")
                    return response
                }
            })
            .defaultStatusHandler(HttpStatusCode::isError) { _, _ -> }
            .build()
    }

}

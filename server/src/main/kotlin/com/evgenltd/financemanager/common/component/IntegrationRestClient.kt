package com.evgenltd.financemanager.common.component

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatusCode
import org.springframework.http.client.BufferingClientHttpRequestFactory
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

@Component
class IntegrationRestClient : RestClient by build() {

    companion object {
        private val log = LoggerFactory.getLogger(IntegrationRestClient::class.java)

        private fun build(): RestClient = RestClient.builder()
            .requestFactory(BufferingClientHttpRequestFactory(SimpleClientHttpRequestFactory()))
            .requestInterceptor { request, body, execution ->
                log.info("REQUEST ${request.method} ${request.uri} body ${String(body)}")
                val response = execution.execute(request, body)
                log.info("RESPONSE ${response.statusCode} ${response.headers}")
                response
            }
            .defaultStatusHandler(HttpStatusCode::isError) { _, _ -> }
            .build()
    }

}

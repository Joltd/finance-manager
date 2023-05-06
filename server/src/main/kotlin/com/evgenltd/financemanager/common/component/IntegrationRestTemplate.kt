package com.evgenltd.financemanager.common.component

import org.springframework.http.HttpMethod
import org.springframework.http.client.ClientHttpResponse
import org.springframework.stereotype.Component
import org.springframework.web.client.ResponseErrorHandler
import org.springframework.web.client.RestTemplate
import java.net.URI

@Component
class IntegrationRestTemplate : RestTemplate() {

    init {
        errorHandler = object : ResponseErrorHandler {
            override fun hasError(response: ClientHttpResponse): Boolean = false

            override fun handleError(response: ClientHttpResponse) {}
        }
    }

}
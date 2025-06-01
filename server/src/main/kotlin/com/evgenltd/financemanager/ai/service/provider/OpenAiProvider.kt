package com.evgenltd.financemanager.ai.service.provider

import com.evgenltd.financemanager.ai.service.AiProvider
import com.evgenltd.financemanager.common.component.IntegrationRestTemplate
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.Base64

@Service
class OpenAiProvider(
    @Value("\${ai.open-ai.api-key}")
    private val apiKey: String,
    private val rest: IntegrationRestTemplate,
) : AiProvider {

    override val name: Provider = Provider.OPEN_AI

    override fun embedding(data: List<String>): List<FloatArray> {
        val request = mapOf(
            "input" to data,
            "model" to "text-embedding-3-small",
            "encoding_format" to "base64",
        )

        val response = request(listOf("embeddings"), request)
        return response?.get("data")
            ?.asSequence()
            ?.map { entry -> entry["embedding"]?.asText()?.asFloatArray() ?: FloatArray(0) }
            ?.toList()
            ?: emptyList()
    }

    private fun request(path: List<String>, body: Any?): JsonNode? {
        val uri = UriComponentsBuilder
            .newInstance()
            .scheme("https")
            .host("api.openai.com")
            .pathSegment("v1", *path.toTypedArray())
            .build()
            .toUri()

        val headers = HttpHeaders()
        headers.setBearerAuth(apiKey)

        val response = rest.exchange(
            uri,
            HttpMethod.POST,
            HttpEntity<Any>(body, headers),
            JsonNode::class.java,
        )

        if (!response.statusCode.is2xxSuccessful) {
            return null
        }

        return response.body
    }

    private fun String.asFloatArray(): FloatArray {
        val bytes = Base64.getDecoder().decode(this)
        val buffer = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN)
        val size = bytes.size / 4
        val array = FloatArray(size)
        for (i in 0 until size) {
            array[i] = buffer.float
        }
        return array
    }

}
package com.evgenltd.financemanager.ai.service.provider

import com.evgenltd.financemanager.ai.record.EmbeddingResult
import com.evgenltd.financemanager.ai.record.ParseEntry
import com.evgenltd.financemanager.ai.record.ParseResult
import com.evgenltd.financemanager.ai.service.AiProvider
import com.evgenltd.financemanager.common.component.IntegrationRestClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import java.io.InputStream
import java.net.URLConnection
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.charset.StandardCharsets
import java.util.*

@Service
class OpenAiProvider(
    @Value("\${ai.open-ai.api-key}")
    private val apiKey: String,
    private val rest: IntegrationRestClient,
    private val mapper: ObjectMapper,
) : AiProvider {

    override val name: AiProviders = AiProviders.OPEN_AI

    override fun embedding(data: List<String>): List<EmbeddingResult> {
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
            ?.mapIndexed { index, it ->
                EmbeddingResult(
                    input = data[index],
                    vector = it
                )
            }
            ?: emptyList()
    }

    override fun parse(filename: String, stream: InputStream, currency: String?): List<ParseEntry> {
        val systemPrompt = javaClass.classLoader
            .getResourceAsStream("prompts/openai/parse.txt")
            ?.bufferedReader(StandardCharsets.UTF_8)
            ?.use { it.readText() }
            ?.trim()
            ?: return emptyList()

        val fileBytes = stream.readAllBytes()
        if (fileBytes.isEmpty()) {
            return emptyList()
        }

        val request = buildParseRequest(filename, fileBytes, currency, systemPrompt)

        val response = request(listOf("responses"), request) ?: return emptyList()
        val outputText = response.extractOutputText() ?: return emptyList()
        return mapper.readValue(outputText, ParseResult::class.java).results
    }

    internal fun buildParseRequest(
        filename: String,
        fileBytes: ByteArray,
        currency: String?,
        systemPrompt: String,
    ): Map<String, Any> {
        val mediaType = URLConnection.guessContentTypeFromName(filename) ?: "application/octet-stream"
        val fileData = "data:$mediaType;base64,${Base64.getEncoder().encodeToString(fileBytes)}"
        val nullableString = mapOf("type" to listOf("string", "null"))
        val propertyNames = listOf(
            "raw",
            "date",
            "direction",
            "amount",
            "currency",
            "transactionId",
            "mcc",
            "bankType",
            "bankCategory",
            "merchant",
            "counterparty",
            "purpose",
            "description",
            "message",
        )

        return mapOf(
            "model" to "gpt-6-luna",
            "input" to listOf(
                mapOf(
                    "role" to "system",
                    "content" to listOf(
                        mapOf(
                            "type" to "input_text",
                            "text" to systemPrompt,
                        )
                    )
                ),
                mapOf(
                    "role" to "user",
                    "content" to listOf(
                        mapOf(
                            "type" to "input_file",
                            "filename" to filename,
                            "file_data" to fileData,
                        ),
                        mapOf(
                            "type" to "input_text",
                            "text" to if (currency.isNullOrBlank()) {
                                "Extract the bank transaction records and their facts from the attached file. No default currency was specified."
                            } else {
                                "Extract the bank transaction records and their facts from the attached file. The user specified ${currency.trim().uppercase(Locale.ROOT)} as the default currency."
                            },
                        )
                    )
                ),
            ),
            "text" to mapOf(
                "format" to mapOf(
                    "type" to "json_schema",
                    "name" to "transaction_parse_results",
                    "strict" to true,
                    "schema" to mapOf(
                        "type" to "object",
                        "additionalProperties" to false,
                        "properties" to mapOf(
                            "results" to mapOf(
                                "type" to "array",
                                "items" to mapOf(
                                    "type" to "object",
                                    "additionalProperties" to false,
                                    "properties" to mapOf(
                                        "raw" to mapOf("type" to "string"),
                                        "date" to nullableString,
                                        "direction" to mapOf(
                                            "type" to listOf("string", "null"),
                                            "enum" to listOf("IN", "OUT", null),
                                        ),
                                        "amount" to nullableString,
                                        "currency" to nullableString,
                                        "transactionId" to nullableString,
                                        "mcc" to nullableString,
                                        "bankType" to nullableString,
                                        "bankCategory" to nullableString,
                                        "merchant" to nullableString,
                                        "counterparty" to nullableString,
                                        "purpose" to nullableString,
                                        "description" to nullableString,
                                        "message" to nullableString,
                                    ),
                                    "required" to propertyNames,
                                )
                            )
                        ),
                        "required" to listOf("results")
                    )
                )
            )
        )

    }

    private fun request(path: List<String>, body: Any): JsonNode? {
        val uri = UriComponentsBuilder
            .newInstance()
            .scheme("https")
            .host("api.openai.com")
            .pathSegment("v1", *path.toTypedArray())
            .build()
            .toUri()

        val response = rest.post()
            .uri(uri)
            .headers { it.setBearerAuth(apiKey) }
            .body(body)
            .retrieve()
            .toEntity(JsonNode::class.java)

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

    private fun JsonNode.extractOutputText(): String? {
        val topLevelText = get("output_text")
            ?.takeIf { !it.isNull }
            ?.asString()
            ?.trim()
            ?.takeIf { it.isNotEmpty() }

        if (topLevelText != null) {
            return topLevelText
        }

        val chunks = get("output")
            ?.asSequence()
            ?.flatMap { output -> output.get("content")?.asSequence() ?: emptySequence() }
            ?.mapNotNull { content ->
                content.get("text")
                    ?.takeIf { !it.isNull }
                    ?.asString()
                    ?.trim()
                    ?.takeIf { it.isNotEmpty() }
            }
            ?.toList()
            ?: emptyList()

        if (chunks.isEmpty()) {
            return null
        }

        return chunks.joinToString("\n")
    }

}

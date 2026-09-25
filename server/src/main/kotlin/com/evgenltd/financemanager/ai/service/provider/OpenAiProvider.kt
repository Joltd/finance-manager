package com.evgenltd.financemanager.ai.service.provider

import com.evgenltd.financemanager.ai.record.EmbeddingResult
import com.evgenltd.financemanager.ai.record.ParseEntry
import com.evgenltd.financemanager.ai.record.ParseResult
import com.evgenltd.financemanager.ai.service.AiProvider
import com.evgenltd.financemanager.common.record.FileMetadata
import com.evgenltd.financemanager.common.service.FileService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatusCode
import org.springframework.http.ResponseEntity
import org.springframework.http.client.BufferingClientHttpRequestFactory
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import org.springframework.web.util.UriComponentsBuilder
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.charset.StandardCharsets
import java.util.Base64

@Service
class OpenAiProvider(
    @Value("\${ai.open-ai.api-key}")
    private val apiKey: String,
    @Value("\${ai.open-ai.parse-model:gpt-6-luna}")
    private val parseModel: String,
    private val mapper: ObjectMapper,
    private val fileService: FileService,
) : AiProvider {

    override val name: AiProviders = AiProviders.OPEN_AI

    override fun embedding(data: List<String>): List<EmbeddingResult> {
        val request = mapOf(
            "input" to data,
            "model" to "text-embedding-3-small",
            "encoding_format" to "base64",
        )

        val response = request(listOf("embeddings"), request)
        return response.get("data")
            ?.asSequence()
            ?.map { entry -> entry["embedding"]?.asString()?.asFloatArray() ?: FloatArray(0) }
            ?.toList()
            ?.mapIndexed { index, it ->
                EmbeddingResult(
                    input = data[index],
                    vector = it,
                )
            }
            ?: emptyList()
    }

    override fun parse(filename: String): List<ParseEntry> {
        val instructions = javaClass.classLoader
            .getResourceAsStream("prompts/openai/parse.txt")
            ?.bufferedReader(StandardCharsets.UTF_8)
            ?.use { it.readText() }
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: throw IllegalStateException("OpenAI bank statement prompt is missing")

        return fileService.loadWithMetadata(filename) { stream, metadata ->
            val content = stream.readBytes()
            if (content.isEmpty()) {
                throw IllegalArgumentException("Stored file [$filename] is empty")
            }
            if (metadata.originalFilename.isBlank() || metadata.contentType.isBlank()) {
                throw IllegalStateException("Metadata for stored file [$filename] is incomplete")
            }

            val response = request(
                path = listOf("responses"),
                body = buildParseRequest(instructions, metadata, content),
            )
            parseResponse(response)
        }
    }

    internal fun parseResponse(response: JsonNode): List<ParseEntry> {
        val outputText = response.extractOutputText()
        return mapper.readValue(outputText, ParseResult::class.java).results
    }

    internal fun buildParseRequest(
        instructions: String,
        metadata: FileMetadata,
        content: ByteArray,
    ): Map<String, Any> {
        val inputFile = mutableMapOf<String, Any>(
            "type" to "input_file",
            "filename" to metadata.originalFilename,
            "file_data" to "data:${metadata.contentType};base64,${Base64.getEncoder().encodeToString(content)}",
        )
        if (metadata.contentType.substringBefore(';').equals("application/pdf", ignoreCase = true)) {
            inputFile["detail"] = "high"
        }

        return mapOf(
            "model" to parseModel,
            "store" to false,
            "instructions" to instructions,
            "input" to listOf(
                mapOf(
                    "role" to "user",
                    "content" to listOf(
                        inputFile,
                        mapOf(
                            "type" to "input_text",
                            "text" to "Extract every bank transaction from this file according to the instructions.",
                        ),
                    ),
                ),
            ),
            "text" to mapOf(
                "format" to mapOf(
                    "type" to "json_schema",
                    "name" to "bank_transaction_parse_results",
                    "strict" to true,
                    "schema" to transactionSchema(),
                ),
            ),
        )
    }

    private fun transactionSchema(): Map<String, Any> {
        val nullableString = mapOf(
            "anyOf" to listOf(
                mapOf("type" to "string"),
                mapOf("type" to "null"),
            ),
        )
        val properties = linkedMapOf<String, Any>(
            "date" to mapOf(
                "anyOf" to listOf(
                    mapOf("type" to "string", "format" to "date"),
                    mapOf("type" to "null"),
                ),
            ),
            "direction" to mapOf(
                "anyOf" to listOf(
                    mapOf("type" to "string", "enum" to listOf("IN", "OUT")),
                    mapOf("type" to "null"),
                ),
            ),
            "amount" to mapOf(
                "anyOf" to listOf(
                    mapOf("type" to "number", "minimum" to 0),
                    mapOf("type" to "null"),
                ),
            ),
            "currency" to nullableString,
            "transactionId" to nullableString,
            "bankType" to nullableString,
            "bankCategory" to nullableString,
            "merchant" to nullableString,
            "counterparty" to nullableString,
            "mcc" to nullableString,
            "purpose" to nullableString,
            "raw" to nullableString,
            "description" to nullableString,
            "message" to nullableString,
        )

        return mapOf(
            "type" to "object",
            "additionalProperties" to false,
            "properties" to mapOf(
                "results" to mapOf(
                    "type" to "array",
                    "items" to mapOf(
                        "type" to "object",
                        "additionalProperties" to false,
                        "properties" to properties,
                        "required" to properties.keys.toList(),
                    ),
                ),
            ),
            "required" to listOf("results"),
        )
    }

    private fun request(path: List<String>, body: Any): JsonNode {
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

        return responseBody(response)
    }

    internal fun responseBody(response: ResponseEntity<JsonNode>): JsonNode {
        if (!response.statusCode.is2xxSuccessful) {
            val message = response.body?.get("error")?.get("message")?.asString()
            throw IllegalStateException(
                "OpenAI API request failed with status ${response.statusCode.value()}" +
                        (message?.let { ": $it" } ?: ""),
            )
        }

        return response.body ?: throw IllegalStateException("OpenAI API returned an empty response")
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

    private fun JsonNode.extractOutputText(): String {
        get("error")
            ?.takeIf { !it.isNull }
            ?.let { error ->
                throw IllegalStateException(
                    error.get("message")?.asString() ?: "OpenAI API returned an unspecified error",
                )
            }

        val status = get("status")?.asString()
        if (status != null && status != "completed") {
            val reason = get("incomplete_details")?.get("reason")?.asString()
            throw IllegalStateException(
                "OpenAI response status is [$status]" + (reason?.let { ": $it" } ?: ""),
            )
        }

        val topLevelText = get("output_text")
            ?.takeIf { !it.isNull }
            ?.asString()
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
        if (topLevelText != null) {
            return topLevelText
        }

        val texts = mutableListOf<String>()
        get("output")?.asSequence().orEmpty()
            .flatMap { output -> output.get("content")?.asSequence() ?: emptySequence() }
            .forEach { content ->
                val type = content.get("type")?.asString()
                val refusal = content.get("refusal")
                    ?.takeIf { !it.isNull }
                    ?.asString()
                    ?.takeIf { it.isNotBlank() }
                if (type == "refusal" || refusal != null) {
                    throw IllegalStateException("OpenAI refused to parse the file${refusal?.let { ": $it" } ?: ""}")
                }
                if (type == "output_text") {
                    content.get("text")
                        ?.takeIf { !it.isNull }
                        ?.asString()
                        ?.trim()
                        ?.takeIf { it.isNotEmpty() }
                        ?.let(texts::add)
                }
            }

        if (texts.isEmpty()) {
            throw IllegalStateException("OpenAI response does not contain output text")
        }
        return texts.joinToString("\n")
    }

    private companion object {
        private val log = LoggerFactory.getLogger(OpenAiProvider::class.java)

        private val rest: RestClient = RestClient.builder()
            .requestFactory(BufferingClientHttpRequestFactory(SimpleClientHttpRequestFactory()))
            .requestInterceptor { request, body, execution ->
                log.info("OPENAI REQUEST ${request.method} ${request.uri} body <redacted>")
                val response = execution.execute(request, body)
                log.info("OPENAI RESPONSE ${response.statusCode} ${response.headers}")
                response
            }
            .defaultStatusHandler(HttpStatusCode::isError) { _, _ -> }
            .build()
    }
}

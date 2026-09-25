package com.evgenltd.financemanager.ai.service.provider

import com.evgenltd.financemanager.ai.record.BankTransactionDirection
import com.evgenltd.financemanager.common.record.FileMetadata
import com.evgenltd.financemanager.common.service.FileService
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import tools.jackson.databind.JsonNode
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.math.BigDecimal
import java.time.LocalDate
import java.util.Base64

class OpenAiProviderTest {

    private val mapper = jacksonObjectMapper()
    private val provider = OpenAiProvider(
        apiKey = "key",
        parseModel = "gpt-6-luna",
        mapper = mapper,
        fileService = mock<FileService>(),
    )

    @Test
    fun `buildParseRequest sends PDF as file input with strict schema`() {
        val content = byteArrayOf(1, 2, 3)

        val request = provider.buildParseRequest(
            instructions = "instructions",
            metadata = FileMetadata("statement.pdf", "application/pdf"),
            content = content,
        )
        val json = request.toJson()

        assertThat(json["model"].asString()).isEqualTo("gpt-6-luna")
        assertThat(json["store"].asBoolean()).isFalse()
        assertThat(json["instructions"].asString()).isEqualTo("instructions")
        val file = json["input"][0]["content"][0]
        assertThat(file["type"].asString()).isEqualTo("input_file")
        assertThat(file["filename"].asString()).isEqualTo("statement.pdf")
        assertThat(file["file_data"].asString())
            .isEqualTo("data:application/pdf;base64,${Base64.getEncoder().encodeToString(content)}")
        assertThat(file["detail"].asString()).isEqualTo("high")

        val format = json["text"]["format"]
        assertThat(format["type"].asString()).isEqualTo("json_schema")
        assertThat(format["strict"].asBoolean()).isTrue()
        val itemSchema = format["schema"]["properties"]["results"]["items"]
        assertThat(itemSchema["additionalProperties"].asBoolean()).isFalse()
        assertThat(itemSchema["required"].size()).isEqualTo(14)
        val directionValues = itemSchema["properties"]["direction"]["anyOf"][0]["enum"]
        assertThat(directionValues.size()).isEqualTo(2)
        assertThat(directionValues[0].asString()).isEqualTo("IN")
        assertThat(directionValues[1].asString()).isEqualTo("OUT")
        assertThat(itemSchema["properties"]["amount"]["anyOf"][0]["minimum"].asInt()).isZero()
    }

    @Test
    fun `buildParseRequest does not add PDF detail to CSV`() {
        val request = provider.buildParseRequest(
            instructions = "instructions",
            metadata = FileMetadata("statement.csv", "text/csv"),
            content = "data".toByteArray(),
        ).toJson()

        assertThat(request["input"][0]["content"][0].has("detail")).isFalse()
    }

    @Test
    fun `parseResponse maps all transaction facts and preserves decimal precision`() {
        val structuredOutput = """
            {
              "results": [
                {
                  "date": "2026-09-24",
                  "direction": "OUT",
                  "amount": 1234567890.1234,
                  "currency": "RUB",
                  "transactionId": "txn-42",
                  "bankType": "CARD_PAYMENT",
                  "bankCategory": "Groceries",
                  "merchant": "Market",
                  "counterparty": null,
                  "mcc": "0541",
                  "purpose": "Card purchase",
                  "raw": "24.09 Market 1 234 567 890,1234 RUB",
                  "description": "Purchase at Market",
                  "message": null
                }
              ]
            }
        """.trimIndent()
        val response = responseWithText(structuredOutput)

        val result = provider.parseResponse(response)

        assertThat(result).hasSize(1)
        val entry = result.single()
        assertThat(entry.date).isEqualTo(LocalDate.of(2026, 9, 24))
        assertThat(entry.direction).isEqualTo(BankTransactionDirection.OUT)
        assertThat(entry.amount).isEqualByComparingTo(BigDecimal("1234567890.1234"))
        assertThat(entry.currency).isEqualTo("RUB")
        assertThat(entry.transactionId).isEqualTo("txn-42")
        assertThat(entry.bankType).isEqualTo("CARD_PAYMENT")
        assertThat(entry.bankCategory).isEqualTo("Groceries")
        assertThat(entry.merchant).isEqualTo("Market")
        assertThat(entry.counterparty).isNull()
        assertThat(entry.mcc).isEqualTo("0541")
        assertThat(entry.purpose).isEqualTo("Card purchase")
        assertThat(entry.raw).startsWith("24.09")
        assertThat(entry.description).isEqualTo("Purchase at Market")
        assertThat(entry.message).isNull()
    }

    @Test
    fun `parseResponse supports an empty result`() {
        assertThat(provider.parseResponse(responseWithText("""{"results": []}"""))).isEmpty()
    }

    @Test
    fun `parseResponse rejects refusal incomplete missing and malformed output`() {
        val refusal = mapOf(
            "status" to "completed",
            "output" to listOf(mapOf("content" to listOf(mapOf("type" to "refusal", "refusal" to "blocked")))),
        ).toJson()
        val incomplete = mapOf(
            "status" to "incomplete",
            "incomplete_details" to mapOf("reason" to "max_output_tokens"),
        ).toJson()
        val missing = mapOf("status" to "completed", "output" to emptyList<Any>()).toJson()

        assertThatThrownBy { provider.parseResponse(refusal) }
            .isInstanceOf(IllegalStateException::class.java)
            .hasMessageContaining("refused")
        assertThatThrownBy { provider.parseResponse(incomplete) }
            .isInstanceOf(IllegalStateException::class.java)
            .hasMessageContaining("max_output_tokens")
        assertThatThrownBy { provider.parseResponse(missing) }
            .isInstanceOf(IllegalStateException::class.java)
            .hasMessageContaining("output text")
        assertThatThrownBy { provider.parseResponse(responseWithText("not-json")) }
            .isInstanceOf(Exception::class.java)
    }

    @Test
    fun `responseBody rejects HTTP errors and empty successful responses`() {
        val error = mapOf("error" to mapOf("message" to "invalid file")).toJson()

        assertThatThrownBy {
            provider.responseBody(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error))
        }
            .isInstanceOf(IllegalStateException::class.java)
            .hasMessageContaining("400")
            .hasMessageContaining("invalid file")
        assertThatThrownBy {
            provider.responseBody(ResponseEntity(null, HttpStatus.OK))
        }
            .isInstanceOf(IllegalStateException::class.java)
            .hasMessageContaining("empty response")
    }

    private fun responseWithText(text: String): JsonNode = mapOf(
        "status" to "completed",
        "output" to listOf(
            mapOf(
                "type" to "message",
                "content" to listOf(mapOf("type" to "output_text", "text" to text)),
            ),
        ),
    ).toJson()

    private fun Any.toJson(): JsonNode = mapper.readTree(mapper.writeValueAsString(this))
}

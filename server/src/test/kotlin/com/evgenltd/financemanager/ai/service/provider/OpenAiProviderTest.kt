package com.evgenltd.financemanager.ai.service.provider

import com.evgenltd.financemanager.common.component.IntegrationRestClient
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import tools.jackson.databind.ObjectMapper
import java.util.Base64

class OpenAiProviderTest {

    private val provider = OpenAiProvider(
        apiKey = "test-key",
        rest = mock<IntegrationRestClient>(),
        mapper = mock<ObjectMapper>(),
    )

    @Test
    fun `buildParseRequest - sends a file currency context and the complete structured schema`() {
        val request = provider.buildParseRequest(
            filename = "statement.csv",
            fileBytes = "date,amount".toByteArray(),
            currency = "rub",
            systemPrompt = "system prompt",
        )

        assertThat(request["model"]).isEqualTo("gpt-6-luna")

        @Suppress("UNCHECKED_CAST")
        val input = request["input"] as List<Map<String, Any>>
        @Suppress("UNCHECKED_CAST")
        val userContent = input[1]["content"] as List<Map<String, Any>>
        assertThat(userContent[0]["type"]).isEqualTo("input_file")
        assertThat(userContent[0]["filename"]).isEqualTo("statement.csv")
        assertThat(userContent[0]["file_data"]).isEqualTo(
            "data:text/csv;base64,${Base64.getEncoder().encodeToString("date,amount".toByteArray())}"
        )
        assertThat(userContent[1]["text"].toString()).contains("RUB")

        @Suppress("UNCHECKED_CAST")
        val text = request["text"] as Map<String, Any>
        @Suppress("UNCHECKED_CAST")
        val format = text["format"] as Map<String, Any>
        @Suppress("UNCHECKED_CAST")
        val schema = format["schema"] as Map<String, Any>
        @Suppress("UNCHECKED_CAST")
        val rootProperties = schema["properties"] as Map<String, Any>
        @Suppress("UNCHECKED_CAST")
        val results = rootProperties["results"] as Map<String, Any>
        @Suppress("UNCHECKED_CAST")
        val items = results["items"] as Map<String, Any>
        @Suppress("UNCHECKED_CAST")
        val properties = items["properties"] as Map<String, Any>

        assertThat(properties.keys).containsExactlyInAnyOrder(
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
        assertThat(items["required"]).isEqualTo(properties.keys.toList())
    }
}

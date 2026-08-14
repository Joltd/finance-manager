package com.evgenltd.financemanager.ai.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.ai.entity.Embedding
import com.evgenltd.financemanager.ai.record.EmbeddingVectorRecord
import com.evgenltd.financemanager.ai.repository.EmbeddingRepository
import com.evgenltd.financemanager.testsupport.ApiResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.ParameterizedTypeReference

class EmbeddingControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var embeddingRepository: EmbeddingRepository

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        embeddingRepository.deleteAll()
    }

    @Test
    fun `vector - returns the stored embedding formatted as a bracketed list`() {
        val embedding = embeddingRepository.save(Embedding(input = "Groceries", vector = floatArrayOf(0.1f, 0.2f, 0.3f)))

        val response = restClient.get()
            .uri("/api/v1/embedding/${embedding.id}/vector")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<EmbeddingVectorRecord>>() {})

        assertThat(response!!.body!!.vector).isEqualTo("[0.1, 0.2, 0.3]")
    }
}

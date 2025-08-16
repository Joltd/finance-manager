package com.evgenltd.financemanager.ai.service

import com.evgenltd.financemanager.ai.record.EmbeddingResult
import org.springframework.stereotype.Service

@Service
class AiService(
    private val aiProviderResolver: AiProviderResolver,
) {

    fun embedding(data: List<String>): List<EmbeddingResult> = if (data.isEmpty()) {
        emptyList()
    } else {
        aiProviderResolver.resolve().embedding(data)
    }

}
package com.evgenltd.financemanager.ai.service

import com.evgenltd.financemanager.ai.record.EmbeddingResult
import com.evgenltd.financemanager.ai.record.ParseEntry
import org.springframework.stereotype.Service
import java.io.InputStream

@Service
class AiService(
    private val aiProviderResolver: AiProviderResolver,
) {

    fun embedding(data: List<String>): List<EmbeddingResult> = if (data.isEmpty()) {
        emptyList()
    } else {
        aiProviderResolver.resolve().embedding(data)
    }

    fun parse(stream: InputStream): List<ParseEntry> = aiProviderResolver.resolve().parse(stream)

}
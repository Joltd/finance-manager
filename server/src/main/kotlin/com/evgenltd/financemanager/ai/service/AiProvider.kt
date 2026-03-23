package com.evgenltd.financemanager.ai.service

import com.evgenltd.financemanager.ai.record.EmbeddingResult
import com.evgenltd.financemanager.ai.record.ParseEntry
import com.evgenltd.financemanager.ai.service.provider.AiProviders
import java.io.InputStream

interface AiProvider {

    val name: AiProviders

    fun embedding(data: List<String>): List<EmbeddingResult>

    fun parse(stream: InputStream): List<ParseEntry>
}
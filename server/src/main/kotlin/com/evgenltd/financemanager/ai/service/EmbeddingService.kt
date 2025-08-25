package com.evgenltd.financemanager.ai.service

import com.evgenltd.financemanager.ai.record.EmbeddingVectorRecord
import com.evgenltd.financemanager.ai.repository.EmbeddingRepository
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.repository.find
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class EmbeddingService(
    private val embeddingRepository: EmbeddingRepository,
) {

    @SkipLogging
    fun vector(id: UUID): EmbeddingVectorRecord? = embeddingRepository.find(id)
        .vector
        ?.joinToString(prefix = "[", postfix = "]")
        ?.let { EmbeddingVectorRecord(it) }

}
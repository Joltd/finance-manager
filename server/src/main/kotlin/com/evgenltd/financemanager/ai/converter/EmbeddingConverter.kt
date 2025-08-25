package com.evgenltd.financemanager.ai.converter

import com.evgenltd.financemanager.ai.entity.Embedding
import com.evgenltd.financemanager.ai.record.EmbeddingRecord
import org.springframework.stereotype.Service

@Service
class EmbeddingConverter {

    fun toRecord(entity: Embedding): EmbeddingRecord = EmbeddingRecord(
        id = entity.id!!,
        input = entity.input,
    )

}
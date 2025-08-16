package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.ai.service.AiService
import com.evgenltd.financemanager.common.entity.Embedding
import com.evgenltd.financemanager.common.repository.EmbeddingRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@Service
class EmbeddingActionService(
    private val aiService: AiService,
    private val embeddingRepository: EmbeddingRepository
) {

    @Transactional(propagation = Propagation.NEVER)
    fun prepareEmbeddings(inputs: List<String>): List<Embedding> = aiService.embedding(inputs)
        .map { Embedding(input = it.input, vector = it.vector) }
        .let { embeddingRepository.saveAll(it) }

}
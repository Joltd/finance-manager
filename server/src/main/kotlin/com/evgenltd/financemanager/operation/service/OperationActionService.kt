package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.common.entity.Embedding
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.repository.OperationRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.util.*

@Service
class OperationActionService(
    private val operationRepository: OperationRepository,
) {

    @Transactional
    fun updateFullEmbedding(operations: List<Operation>, embeddings: List<Embedding>) {
        operations.zip(embeddings).onEach { (operation, embedding) ->
            operation.full = embedding
        }
        operationRepository.saveAll(operations)
    }

}
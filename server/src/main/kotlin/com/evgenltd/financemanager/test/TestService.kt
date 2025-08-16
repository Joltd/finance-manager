package com.evgenltd.financemanager.test

import com.evgenltd.financemanager.ai.service.AiService
import com.evgenltd.financemanager.common.entity.Embedding
import com.evgenltd.financemanager.common.repository.EmbeddingRepository
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.operationEmbeddingInput
import com.evgenltd.financemanager.importexport.entity.ImportDataOperation
import com.evgenltd.financemanager.importexport.repository.ImportDataOperationRepository
import com.evgenltd.financemanager.operation.repository.OperationRepository
import jakarta.annotation.PostConstruct
import org.springframework.stereotype.Service
import java.util.*

@Service
class TestService(
    private val operationRepository: OperationRepository,
    private val importDataOperationRepository: ImportDataOperationRepository,
    private val aiService: AiService,
    private val embeddingRepository: EmbeddingRepository,
) {

//    @PostConstruct
    fun init() {
        val operation = operationRepository.find(UUID.fromString("d1bc718e-4a2b-4bdc-9602-09825cf56c26"))
        val importDataOperation = importDataOperationRepository.find(UUID.fromString("045e9640-8346-4b11-b9a9-761f2106aab0"))

        val oE = operationEmbeddingInput(
            operation.date,
            operation.type,
            operation.amountFrom,
            operation.accountFrom.name,
            operation.amountTo,
            operation.accountTo.name,
        )

        val idoE = operationEmbeddingInput(
            importDataOperation.date,
            importDataOperation.type,
            importDataOperation.amountFrom,
            importDataOperation.accountFrom?.name,
            importDataOperation.amountTo,
            importDataOperation.accountTo?.name,
        )

        println(operation)
        println(oE)
        println(importDataOperation)
        println(idoE)

        val oEresult = aiService.embedding(listOf(oE)).first()
        embeddingRepository.save(Embedding(input = oEresult.input, vector = oEresult.vector)).also { println("oE id = ${it.id}") }

        val idoEresult = aiService.embedding(listOf(idoE)).first()
        embeddingRepository.save(Embedding(input = idoEresult.input, vector = idoEresult.vector)).also { println("idoE id = ${it.id}") }
    }

}
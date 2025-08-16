package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.ai.service.AiService
import com.evgenltd.financemanager.common.entity.Embedding
import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.record.until
import com.evgenltd.financemanager.common.repository.EmbeddingRepository
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.isNull
import com.evgenltd.financemanager.common.repository.or
import com.evgenltd.financemanager.common.service.EmbeddingActionService
import com.evgenltd.financemanager.common.util.operationEmbeddingInput
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.OperationEvent
import com.evgenltd.financemanager.operation.repository.OperationRepository
import org.springframework.core.annotation.Order
import org.springframework.data.domain.PageRequest
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.transaction.event.TransactionalEventListener
import java.time.LocalDate

@Service
class OperationEmbeddingService(
    private val operationRepository: OperationRepository,
    private val operationActionService: OperationActionService,
    private val embeddingActionService: EmbeddingActionService,
) {

    fun calculateEmbeddings(account: Account, from: LocalDate, to: LocalDate) {
        val query = ((byAccount(account)) and (Operation::date between (from until to)) and Operation::full.isNull())

        var page = 0
        var hasNext = true

        while (hasNext) {
            val pageRequest = PageRequest.of(page, 50)
            val result = operationRepository.findAll(query, pageRequest)

            result.content.prepareEmbeddings()

            hasNext = result.hasNext()
            page++
        }
    }

    @TransactionalEventListener
    @Order(30)
    @Async
    fun operationChanged(event: OperationEvent) {
        event.entries.mapNotNull { it.new }.prepareEmbeddings()
    }

    private fun List<Operation>.prepareEmbeddings() {
        map {
            operationEmbeddingInput(
                date = it.date,
                type = it.type,
                amountFrom = it.amountFrom,
                accountFrom = it.accountFrom.name,
                amountTo = it.amountTo,
                accountTo = it.accountTo.name,
            )
        }.let { embeddingActionService.prepareEmbeddings(it) }
            .let { operationActionService.updateFullEmbedding(this, it) }
    }

}
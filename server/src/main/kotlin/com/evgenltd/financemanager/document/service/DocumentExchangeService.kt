package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.document.entity.DocumentExchange
import com.evgenltd.financemanager.document.record.DocumentExchangeRecord
import com.evgenltd.financemanager.document.repository.DocumentExchangeRepository
import com.evgenltd.financemanager.reference.service.AccountService
import com.evgenltd.financemanager.transaction.event.RebuildGraphEvent
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DocumentExchangeService(
    private val documentExchangeRepository: DocumentExchangeRepository,
    private val accountService: AccountService,
    private val transactionService: TransactionService
) : DocumentTypedService<DocumentExchange, DocumentExchangeRecord> {

    @Transactional
    override fun update(entity: DocumentExchange) {
        documentExchangeRepository.save(entity)
        transactionService.deleteByDocument(entity.id!!)
        transactionService.exchange(
                date = entity.date,
                amountFrom = entity.amountFrom,
                accountFrom = entity.accountFrom,
                amountTo = entity.amountTo,
                accountTo = entity.accountTo,
                document = entity.id!!
        )
    }

    override fun toRecord(entity: DocumentExchange): DocumentExchangeRecord = DocumentExchangeRecord(
            id = entity.id,
            date = entity.date,
            description = entity.description,
            accountFrom = entity.accountFrom,
            accountFromName = accountService.name(entity.accountFrom),
            amountFrom = entity.amountFrom,
            accountTo = entity.accountTo,
            accountToName = accountService.name(entity.accountTo),
            amountTo = entity.amountTo
    )

    override fun toEntity(record: DocumentExchangeRecord): DocumentExchange = DocumentExchange(
            id = record.id,
            date = record.date,
            description = record.description,
            accountFrom = accountService.findOrCreate(record.accountFrom, record.accountFromName).id!!,
            amountFrom = record.amountFrom,
            accountTo = accountService.findOrCreate(record.accountTo, record.accountToName).id!!,
            amountTo = record.amountTo
    )
}
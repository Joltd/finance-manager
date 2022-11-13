package com.evgenltd.financemanager.document.service

import com.evgenltd.financemanager.document.entity.DocumentExchange
import com.evgenltd.financemanager.document.record.DocumentExchangeRecord
import com.evgenltd.financemanager.document.repository.DocumentExchangeRepository
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.reference.repository.AccountRepository
import com.evgenltd.financemanager.reference.repository.name
import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.ExchangeTransaction
import com.evgenltd.financemanager.transaction.service.AccountTransactionService
import com.evgenltd.financemanager.transaction.service.TransactionService
import org.springframework.stereotype.Service

@Service
class DocumentExchangeService(
        private val documentExchangeRepository: DocumentExchangeRepository,
        private val transactionService: TransactionService,
        private val accountRepository: AccountRepository,
        private val exchangeRateService: ExchangeRateService,
        private val accountTransactionService: AccountTransactionService
) : DocumentTypedService<DocumentExchange, DocumentExchangeRecord> {

    override fun hash(record: DocumentExchangeRecord): String =
            "${record.date}-${record.accountFrom}-${record.amountFrom}-${record.accountTo}-${record.amountTo}"

    override fun update(entity: DocumentExchange) {
        documentExchangeRepository.save(entity)
        transactionService.deleteByDocument(entity.id!!)

        ExchangeTransaction(null, entity.date, Direction.IN, entity.amountFrom, entity.id!!).also { transactionService.save(it) }
        with(entity) { accountTransactionService.output(date, amountFrom, id!!, accountFrom) }

        with(entity) { accountTransactionService.input(date, amountTo, id!!, accountTo) }
        ExchangeTransaction(null, entity.date, Direction.OUT, entity.amountTo, entity.id!!).also { transactionService.save(it) }

        exchangeRateService.saveRate(entity.date, entity.amountFrom, entity.amountTo)
    }

    override fun toRecord(entity: DocumentExchange): DocumentExchangeRecord = DocumentExchangeRecord(
            id = entity.id,
            date = entity.date,
            description = entity.description,
            accountFrom = entity.accountFrom,
            accountFromName = accountRepository.name(entity.accountFrom),
            amountFrom = entity.amountFrom,
            accountTo = entity.accountTo,
            accountToName = accountRepository.name(entity.accountTo),
            amountTo = entity.amountTo
    )

    override fun toEntity(record: DocumentExchangeRecord): DocumentExchange = DocumentExchange(
            id = record.id,
            date = record.date,
            description = record.description,
            accountFrom = record.accountFrom,
            amountFrom = record.amountFrom,
            accountTo = record.accountTo,
            amountTo = record.amountTo
    )
}
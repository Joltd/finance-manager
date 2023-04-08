package com.evgenltd.financemanager.transaction.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.event.AccountActualOnEvent
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.entity.Transaction
import com.evgenltd.financemanager.transaction.event.ResetGraphEvent
import com.evgenltd.financemanager.transaction.record.Usage
import com.evgenltd.financemanager.transaction.repository.TransactionRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class TransactionService(
    private val transactionRepository: TransactionRepository,
    private val relationService: RelationService,
    private val eventPublisher: ApplicationEventPublisher
) {

    fun inflow(date: LocalDate, amount: Amount, document: String, account: String, incomeCategory: String? = null) {
        val transaction = Transaction(
            id = null,
            direction = Direction.IN,
            date = date,
            amount = amount,
            document = document,
            account = account,
            incomeCategory = incomeCategory
        )
        transactionRepository.save(transaction)
        eventPublisher.publishEvent(ResetGraphEvent(date))
        eventPublisher.publishEvent(AccountActualOnEvent(account, date))
    }

    fun outflow(date: LocalDate, amount: Amount, document: String, account: String, expenseCategory: String? = null) {
        val transaction = Transaction(
            id = null,
            direction = Direction.OUT,
            date = date,
            amount = amount,
            document = document,
            account = account,
            expenseCategory = expenseCategory
        )
        transactionRepository.save(transaction)
        eventPublisher.publishEvent(ResetGraphEvent(date))
        eventPublisher.publishEvent(AccountActualOnEvent(account, date))
    }

    fun exchange(
        date: LocalDate,
        amountFrom: Amount,
        accountFrom: String,
        amountTo: Amount,
        accountTo: String,
        document: String,
    ) {
        val transactionFrom = Transaction(
            id = null,
            direction = Direction.OUT,
            date = date,
            amount = amountFrom,
            document = document,
            account = accountFrom
        )
        val transactionTo = Transaction(
            id = null,
            direction = Direction.IN,
            date = date,
            amount = amountTo,
            document = document,
            account = accountTo
        )
        transactionRepository.saveAll(listOf(transactionFrom, transactionTo))
        relationService.saveExchangeRelation(date, transactionFrom, transactionTo)
        eventPublisher.publishEvent(ResetGraphEvent(date))
        eventPublisher.publishEvent(AccountActualOnEvent(accountFrom, date))
        eventPublisher.publishEvent(AccountActualOnEvent(accountTo, date))
    }

    fun deleteByDocument(document: String) {
        val transactions = transactionRepository.findByDocument(document)
        if (transactions.isEmpty()) {
            return
        }
        transactionRepository.deleteAll(transactions)
        val resetDate = transactions.minOf { it.date }
        eventPublisher.publishEvent(ResetGraphEvent(resetDate))
    }

    fun findByAccount(account: String): List<Transaction> = transactionRepository.findByAccount(account)

    fun usageByAccount(account: String): Usage = transactionRepository.findByAccount(account).size.let { Usage(it.toString()) }

    fun usageByIncomeCategory(incomeCategory: String): Usage = transactionRepository.findByIncomeCategory(incomeCategory).size.let { Usage(it.toString()) }

    fun usageByExpenseCategory(expenseCategory: String): Usage = transactionRepository.findByExpenseCategory(expenseCategory).size.let { Usage(it.toString()) }

}
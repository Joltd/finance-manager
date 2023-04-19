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
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class TransactionService(
    private val transactionRepository: TransactionRepository,
    private val relationService: RelationService,
    private val eventPublisher: ApplicationEventPublisher
) {

    @Transactional
    fun flow(
        direction: Direction,
        date: LocalDate,
        amount: Amount,
        document: String,
        account: String,
        incomeCategory: String? = null,
        expenseCategory: String? = null
    ) {
        val transaction = Transaction(
            id = null,
            direction = direction,
            date = date,
            amount = amount,
            document = document,
            account = account,
            incomeCategory = incomeCategory,
            expenseCategory = expenseCategory
        )
        transactionRepository.save(transaction)
        eventPublisher.publishEvent(ResetGraphEvent(date))
        eventPublisher.publishEvent(AccountActualOnEvent(account, date))
    }

    @Transactional
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
        relationService.saveExchangeRelation(date, transactionFrom, transactionTo, document)
        eventPublisher.publishEvent(ResetGraphEvent(date))
        eventPublisher.publishEvent(AccountActualOnEvent(accountFrom, date))
        eventPublisher.publishEvent(AccountActualOnEvent(accountTo, date))
    }

    @Transactional
    fun deleteByDocument(document: String) {
        val transactions = transactionRepository.findByDocument(document)
        if (transactions.isEmpty()) {
            return
        }
        transactionRepository.deleteAll(transactions)
        relationService.deleteByDocument(document)
        val resetDate = transactions.minOf { it.date }
        eventPublisher.publishEvent(ResetGraphEvent(resetDate))
    }

    fun findByAccount(account: String): List<Transaction> = transactionRepository.findByAccount(account)

    fun usageByAccount(account: String): Usage = transactionRepository.findByAccount(account).size.let { Usage(it.toString()) }

    fun usageByIncomeCategory(incomeCategory: String): Usage = transactionRepository.findByIncomeCategory(incomeCategory).size.let { Usage(it.toString()) }

    fun usageByExpenseCategory(expenseCategory: String): Usage = transactionRepository.findByExpenseCategory(expenseCategory).size.let { Usage(it.toString()) }

    fun findTransactionsOrdered(date: LocalDate): List<Transaction> =
        transactionRepository.findByDateGreaterThanOrderByDateAscDirectionAsc(date)

    fun findTransactions(from: LocalDate, to: LocalDate): List<Transaction> =
        transactionRepository.findByDateBetween(from, to)

    fun findTransactions(from: LocalDate, to: LocalDate, account: String, currency: String): List<Transaction> =
        transactionRepository.findByDateBetweenAndAccountAndCurrency(from, to, account, currency)

    fun findTransactions(ids: List<String>): List<Transaction> =
        transactionRepository.findAllById(ids).toList()

}
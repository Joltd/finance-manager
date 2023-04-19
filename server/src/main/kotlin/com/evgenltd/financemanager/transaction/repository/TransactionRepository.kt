package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.Transaction
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import java.time.LocalDate

interface TransactionRepository : MongoRepository<Transaction, String> {

    fun findByDocument(document: String): List<Transaction>

    fun findByDateGreaterThanOrderByDateAscDirectionAsc(date: LocalDate): List<Transaction>

    @Query("{'date': { \$gte: ?0, \$lt: ?1 }}")
    fun findByDateBetween(from: LocalDate, to: LocalDate): List<Transaction>

    @Query("{'date': { \$gte: ?0, \$lt: ?1 }, 'account': ?2, 'amount.currency': ?3}")
    fun findByDateBetweenAndAccountAndCurrency(from: LocalDate, to: LocalDate, account: String, currency: String): List<Transaction>

    fun findByAccount(account: String): List<Transaction>

    fun findByIncomeCategory(incomeCategory: String): List<Transaction>

    fun findByExpenseCategory(expenseCategory: String): List<Transaction>

}
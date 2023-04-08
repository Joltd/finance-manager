package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.Transaction
import org.springframework.data.mongodb.repository.MongoRepository
import java.time.LocalDate

interface TransactionRepository : MongoRepository<Transaction, String> {

    fun findByDocument(document: String): List<Transaction>

    fun findByDateGreaterThanOrderByDateAscDirectionAsc(date: LocalDate): List<Transaction>

    fun findByAccount(account: String): List<Transaction>

    fun findByIncomeCategory(incomeCategory: String): List<Transaction>

    fun findByExpenseCategory(expenseCategory: String): List<Transaction>

}
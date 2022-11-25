package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.ExpenseTransaction
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import java.time.LocalDate

interface ExpenseTransactionRepository : MongoRepository<ExpenseTransaction, String> {

    fun findByExpenseCategory(expenseCategory: String): List<ExpenseTransaction>

    @Query("{'date': { \$gte: ?0, \$lt: ?1 }, 'expenseCategory': { \$ne: null }}")
    fun findByDate(from: LocalDate, to: LocalDate): List<ExpenseTransaction>

}
package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.ExpenseTransaction
import org.springframework.data.mongodb.repository.MongoRepository

interface ExpenseTransactionRepository : MongoRepository<ExpenseTransaction, String> {

    fun findByExpenseCategoryNotNull(): List<ExpenseTransaction>

}
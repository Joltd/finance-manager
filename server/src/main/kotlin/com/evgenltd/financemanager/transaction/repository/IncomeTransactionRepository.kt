package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.IncomeTransaction
import org.springframework.data.mongodb.repository.MongoRepository

interface IncomeTransactionRepository : MongoRepository<IncomeTransaction, String> {

    fun findByIncomeCategoryNotNull(): List<IncomeTransaction>

    fun findByIncomeCategoryIn(categories: List<String>): List<IncomeTransaction>

    fun findByIncomeCategory(incomeCategory: String): List<IncomeTransaction>

}
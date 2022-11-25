package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.IncomeTransaction
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import java.time.LocalDate

interface IncomeTransactionRepository : MongoRepository<IncomeTransaction, String> {

    fun findByIncomeCategory(incomeCategory: String): List<IncomeTransaction>

    @Query("{'date': { \$gte: ?0, \$lt: ?1 }, 'incomeCategory': { \$ne: null }}")
    fun findByDate(from: LocalDate, to: LocalDate): List<IncomeTransaction>

}
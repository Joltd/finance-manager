package com.evgenltd.financemanager.operation.repository

import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.account.entity.Account
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

@Repository
interface TransactionRepository : JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {

    fun deleteByOperation(operation: Operation)

    fun findByAccountAndAmountCurrencyAndDateGreaterThanEqual(account: Account, currency: String, date: LocalDate): List<Transaction>

    @Query("select max(t.date) from Transaction t")
    fun findLastDate(): LocalDate?

}
package com.evgenltd.financemanager.operation.repository

import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.reference.entity.Account
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

@Repository
interface TransactionRepository : JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {

    fun deleteByOperationId(id: UUID)

    fun findByDateGreaterThanEqual(date: LocalDate): List<Transaction>

    fun findFirstByOrderByUpdatedAtDesc(): Transaction?

    fun findByAccountAndAmountCurrencyAndDateGreaterThanEqual(account: Account, currency: String, date: LocalDate): List<Transaction>

}
package com.evgenltd.financemanager.operation.repository

import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.AccountType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

@Repository
interface TransactionRepository : JpaRepository<Transaction, UUID> {

    fun deleteByOperationId(id: UUID)

    fun findByAccount(account: Account): List<Transaction>

    fun findByDateGreaterThanEqual(date: LocalDate): List<Transaction>

    fun findByAccountType(type: AccountType): List<Transaction>

    fun findFirstByOrderByUpdatedAtDesc(): Transaction?

}
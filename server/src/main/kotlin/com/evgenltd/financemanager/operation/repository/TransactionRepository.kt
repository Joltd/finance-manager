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

    fun findByDateGreaterThanEqualAndDateLessThanAndAccountTypeIn(from: LocalDate, to: LocalDate, types: List<AccountType>): List<Transaction>

    fun findByDateGreaterThanEqualAndDateLessThanAndAccountIdIn(from: LocalDate, to: LocalDate, accountIds: List<UUID>): List<Transaction>

    fun findByAccountType(type: AccountType): List<Transaction>

}
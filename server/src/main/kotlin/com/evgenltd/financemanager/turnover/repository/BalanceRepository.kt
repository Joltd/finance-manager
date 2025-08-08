package com.evgenltd.financemanager.turnover.repository

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.turnover.entity.Balance
import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import java.time.LocalDate
import java.util.*

interface BalanceRepository : JpaRepository<Balance, UUID>, JpaSpecificationExecutor<Balance> {

    fun findByAccountAndAmountCurrency(account: Account, currency: String): Balance?

    fun findByNextDateIsNotNullAndProgressIsFalse(): List<Balance>

    @Query("""
        update balances set next_date = :nextDate
        where 
            account_id = :account
            and amount_currency = :currency 
            and (next_date is null or :nextDate < next_date)
    """, nativeQuery = true)
    @Modifying
    fun invalidate(account: UUID, currency: String, nextDate: LocalDate)

    @Query("select b from Balance b where b.id = :id")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    fun findAndLock(id: UUID): Balance?

    @Query("select b from Balance b where b.account = :account and b.amount.currency = :currency")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    fun findAndLock(account: Account, currency: String): Balance?


}
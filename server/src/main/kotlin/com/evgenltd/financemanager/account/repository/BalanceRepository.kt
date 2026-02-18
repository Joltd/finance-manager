package com.evgenltd.financemanager.account.repository

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.Balance
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import java.time.LocalDate
import java.util.*

interface BalanceRepository : JpaRepository<Balance, UUID>, JpaSpecificationExecutor<Balance> {

    fun findByAccountAndAmountCurrency(account: Account, currency: String): Balance?

    @Modifying
    @Query("""
        insert into balances (tenant, account_id, amount_value, amount_currency, date, calculation_date, calculation_version)
        values (:tenant, :accountId, 0, :currenct, :calculationDate, :calculationDate, 1)
        on conflict (tenant, account_id, amount_currency) 
        do update set 
            calculation_date = :calculationDate, 
            calculation_version = coalesce(balances.calculation_version, 0) + 1
        where
            excluded.calculation_date < balances.calculation_date 
        returning *
    """, nativeQuery = true)
    fun calculationRequest(tenant: UUID, accountId: UUID, currency: String, calculationDate: LocalDate): Balance

    @Modifying
    @Query("""
        update balances
        set
            calculation_date = null, 
            calculation_version = null
        where 
            calculation_date = :calculationDate and
            calculation_version = :calculationVersion and
    """, nativeQuery = true)
    fun calculationCompleted(id: UUID, calculationDate: LocalDate, calculationVersion: Int)

    fun findByCalculationDateIsNotNull(): List<Balance>

}
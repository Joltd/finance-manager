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

    fun findByAccount(account: Account): List<Balance>

    fun findByAccountAndAmountCurrency(account: Account, currency: String): Balance?

    fun findByAccountIdAndAmountCurrency(accountId: UUID, currency: String): Balance?

    @Modifying
    @Query("""
        insert into balances (id, tenant, account_id, amount_value, amount_currency, date, calculation_date, calculation_version)
        values (gen_random_uuid(), :tenant, :accountId, 0, :currency, :calculationDate, :calculationDate, 1)
        on conflict (tenant, account_id, amount_currency)
        do update set
            calculation_date = :calculationDate,
            calculation_version = coalesce(balances.calculation_version, 0) + 1
        where
            balances.calculation_date is null
            or excluded.calculation_date < balances.calculation_date
    """, nativeQuery = true)
    fun calculationRequest(tenant: UUID, accountId: UUID, currency: String, calculationDate: LocalDate)

    @Modifying
    @Query("""
        update balances
        set
            calculation_date = null,
            calculation_version = null
        where
            id = :id
            and calculation_date = :calculationDate
            and calculation_version = :calculationVersion
    """, nativeQuery = true)
    fun calculationCompleted(id: UUID, calculationDate: LocalDate, calculationVersion: Int)

    fun findByCalculationDateIsNotNull(): List<Balance>

}
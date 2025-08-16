package com.evgenltd.financemanager.account.repository

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Turnover
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

@Repository
interface TurnoverRepository : JpaRepository<Turnover, UUID>, JpaSpecificationExecutor<Turnover> {

    fun deleteByAccountAndAmountCurrencyAndDateGreaterThanEqual(account: Account, currency: String, date: LocalDate)

    fun findFirstByAccountAndAmountCurrencyAndDateLessThanOrderByDateDesc(account: Account, currency: String, date: LocalDate): Turnover?

    fun findByAccountType(type: AccountType): List<Turnover>

    fun findByAccount(account: Account): List<Turnover>

}
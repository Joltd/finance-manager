package com.evgenltd.financemanager.turnover.repository

import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.turnover.entity.Turnover
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.UUID

@Repository
interface TurnoverRepository : JpaRepository<Turnover, UUID>, JpaSpecificationExecutor<Turnover> {

    fun deleteByDateGreaterThanEqual(date: LocalDate)

    fun findByAccountType(type: AccountType): List<Turnover>

    fun findByAccount(account: Account): List<Turnover>

    fun findByDateLessThan(date: LocalDate): List<Turnover>

}
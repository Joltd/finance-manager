package com.evgenltd.financemanager.turnover.repository

import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.turnover.entity.Turnover
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.UUID

@Repository
interface TurnoverRepository : JpaRepository<Turnover, UUID>, JpaSpecificationExecutor<Turnover> {

    fun deleteByDateGreaterThanEqual(date: LocalDate)

    fun findByAccountType(type: AccountType): List<Turnover>

    fun findByAccount(account: Account): List<Turnover>

    fun findByDateLessThan(date: LocalDate): List<Turnover>

    @Query("""
        select id 
        from turnovers
        where (account_id, amount_currency, date) in (
            select
                t.account_id, t.amount_currency, max(t.date)
            from turnovers t
            left join accounts a on t.account_id = a.id
            where
                a.type = 'ACCOUNT'
            group by
                t.account_id, t.amount_currency
        )
    """, nativeQuery = true)
    fun findSliceLast(): List<UUID>

}
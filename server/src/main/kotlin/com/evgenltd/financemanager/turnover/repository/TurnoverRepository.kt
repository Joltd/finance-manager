package com.evgenltd.financemanager.turnover.repository

import com.evgenltd.financemanager.turnover.entity.Turnover
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.UUID

@Repository
interface TurnoverRepository : JpaRepository<Turnover, UUID> {

    fun deleteByDateGreaterThanEqual(date: LocalDate)

}
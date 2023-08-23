package com.evgenltd.financemanager.exchangerate.repository

import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface ExchangeRateRepository : JpaRepository<ExchangeRate, String> {

    fun findByDateGreaterThanEqualAndDateLessThan(from: LocalDate, to: LocalDate): List<ExchangeRate>

}
package com.evgenltd.financemanager.exchangerate.repository

import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import org.springframework.data.mongodb.repository.MongoRepository
import java.time.LocalDate

interface ExchangeRateRepository : MongoRepository<ExchangeRate, String> {

    fun findByDateLessThanEqual(date: LocalDate): List<ExchangeRate>

    fun findByDateAndFromAndTo(date: LocalDate, from: String, to: String): ExchangeRate?

}
package com.evgenltd.financemanager.exchangerate.repository

import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import java.time.LocalDate

interface ExchangeRateRepository : MongoRepository<ExchangeRate, String> {

    @Query("{'date': { \$gte: ?0, \$lt: ?1 }}")
    fun findByDateGreaterThanEqualAndDateLessThan(from: LocalDate, to: LocalDate): List<ExchangeRate>

}
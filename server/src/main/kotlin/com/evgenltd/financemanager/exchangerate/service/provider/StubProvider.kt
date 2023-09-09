package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.exchangerate.service.ExchangeRateProvider
import jakarta.annotation.PostConstruct
import org.springframework.context.annotation.Profile
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
@Profile("dev")
@Order(1)
class StubProvider : ExchangeRateProvider {

    override fun rate(date: LocalDate, from: String, to: String): BigDecimal? =
        RATES["$from$to"] ?: RATES["$to$from"] ?: BigDecimal.ONE

    companion object {
        val RATES: Map<String,BigDecimal> = mapOf(
            "GELUSD" to BigDecimal("0.38"),
            "KZTUSD" to BigDecimal("0.0022"),
        )
    }

}
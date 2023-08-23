package com.evgenltd.financemanager.exchangerate.service.provider

import com.evgenltd.financemanager.exchangerate.record.ExchangeRateRecord
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateProvider
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import jakarta.annotation.PostConstruct
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
//@Order(1)
class StubProvider : ExchangeRateProvider {

//    @PostConstruct
//    fun postConstruct() {
//        val ratesFile = {}.javaClass.getResource("/rates.json")
//        val mapper = jacksonObjectMapper()
//        mapper.registerModule(JavaTimeModule())
//        mapper.readValue<List<ExchangeRateRecord>>(ratesFile)
//            .groupBy { "${it.from}${it.to}" }
//            .entries
//            .associate { it.key to it.value.maxByOrNull { record -> record.date }!!.value }
//            .let { RATES.putAll(it) }
//    }

    override fun rate(date: LocalDate, from: String, toCurrencies: Set<String>, gap: Long): Map<String, BigDecimal> {
        return toCurrencies.associateWith { search(from, it) }
    }

    private fun search(from: String, to: String): BigDecimal =
        RATES["$from$to"] ?: RATES["$to$from"] ?: BigDecimal.ONE

    companion object {
        val RATES: MutableMap<String,BigDecimal> = mutableMapOf()
    }

}
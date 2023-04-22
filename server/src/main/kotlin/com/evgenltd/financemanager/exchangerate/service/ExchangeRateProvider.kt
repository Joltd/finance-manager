package com.evgenltd.financemanager.exchangerate.service

import java.math.BigDecimal
import java.time.LocalDate

interface ExchangeRateProvider {

    fun rate(date: LocalDate, from: String, to: String): BigDecimal?

}
package com.evgenltd.financemanager.exchangerate.record

import org.springframework.context.ApplicationEvent
import java.time.LocalDate

class ExchangeRateRequestEvent(val date: LocalDate, val currencies: List<String>) : ApplicationEvent(date) {}
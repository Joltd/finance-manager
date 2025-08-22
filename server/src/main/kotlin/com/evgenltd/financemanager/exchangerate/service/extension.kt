package com.evgenltd.financemanager.exchangerate.service

import com.evgenltd.financemanager.account.entity.Currency
import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import java.time.Instant
import java.time.temporal.ChronoUnit

fun List<ExchangeRate>.outdated(currencies: List<Currency>): Set<String> =
    currencies.map { it.name }.toSet() -
            filter { it.updatedAt != null && ChronoUnit.DAYS.between(it.updatedAt, Instant.now()) < 1 }
                .map { it.currency }
                .toSet()

fun List<Currency>.outdated(rates: List<ExchangeRate>): List<Currency> {
    val actual = rates
        .filter {
            it.updatedAt != null && ChronoUnit.DAYS.between(it.updatedAt, Instant.now()) < 1
        }
        .map { it.currency }
        .toSet()

    return filter { it.name !in actual }
}
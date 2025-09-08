package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.record.Range
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.time.temporal.TemporalAdjusters

fun DateRange?.validWeek(): Range<LocalDate> {
    val actualFrom = this?.from ?: this?.to ?: LocalDate.now()
    val actualTo = actualFrom.plusWeeks(1L)
    return Range(actualFrom, actualTo)
}

fun DateRange?.validHalfYear(): Range<LocalDate> {
    if (this != null && from != null && to != null && ChronoUnit.MONTHS.between(from, to) in 0..7) {
        return Range(from, to)
    }

    val actualTo = LocalDate.now().withDayOfMonth(1).plusMonths(1)

    return Range(
        from = actualTo.minusMonths(6),
        to = actualTo
    )
}

infix fun <T> T?.until(other: T?): Range<T> = Range(this, other)

fun LocalDate.withMonday(): LocalDate = with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))

fun LocalDate.withNextMonday(): LocalDate = with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY))
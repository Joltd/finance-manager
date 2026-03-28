package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.util.badRequestException
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.TemporalAdjusters

fun DateRange?.validWeek(): Range<LocalDate> {
    val actualFrom = this?.from ?: this?.to ?: LocalDate.now()
    val actualTo = actualFrom.plusWeeks(1L)
    return Range(actualFrom, actualTo)
}

fun DateRange?.validMonthRange(): Range<LocalDate> {
    if (this == null || from == null || to == null) {
        throw badRequestException("Date range is not valid")
    }

    return Range(
        from.withDayOfMonth(1),
        to.plusMonths(1).withDayOfMonth(1)
    )
}

infix fun <T> T?.until(other: T?): Range<T> = Range(this, other)

fun LocalDate.withMonday(): LocalDate = with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))

fun LocalDate.withNextMonday(): LocalDate = with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY))
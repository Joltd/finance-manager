package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.record.Range
import java.time.LocalDate

fun DateRange?.validWeek(): Range<LocalDate> {
    val actualFrom = this?.from ?: this?.to ?: LocalDate.now()
    val actualTo = actualFrom.plusWeeks(1L)
    return Range(actualFrom, actualTo)
}
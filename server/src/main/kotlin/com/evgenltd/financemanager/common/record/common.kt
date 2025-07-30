package com.evgenltd.financemanager.common.record

import java.time.LocalDate

data class Range<T>(val from: T?, val to: T?)

data class DateRange(val from: LocalDate?, val to: LocalDate?)

data class SortRecord(val field: String, val direction: SortDirection)

enum class SortDirection {
    ASC,
    DESC
}

data class EntityPageRequest<T>(
    val page: Int = 0,
    val size: Int = 50,
    val sort: List<SortRecord> = emptyList(),
    val filter: T?,
)

data class EntityPageResponse<T>(
    val page: Int,
    val size: Int,
    val records: List<T>,
    val total: Long,
)

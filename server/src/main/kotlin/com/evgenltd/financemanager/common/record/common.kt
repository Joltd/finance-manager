package com.evgenltd.financemanager.common.record

import java.time.LocalDate
import java.util.*

data class Response(val success: Boolean, val body: Any?, val error: String?)

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

data class Reference(
    val id: UUID,
    val name: String,
    val deleted: Boolean = false,
)

enum class NotificationType {
    ERROR,
    WARNING,
    INFO,
}

data class NotificationRecord(
    val type: NotificationType,
    val message: String,
)
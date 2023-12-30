package com.evgenltd.financemanager.entity.record

data class EntityRecord(
    val name: String,
    val label: String,
    val fields: List<EntityFieldRecord>,
)

data class EntityFieldRecord(
    val name: String,
)

data class Sort(val field: String, val direction: SortDirection)

enum class SortDirection {
    ASC,
    DESC
}

data class EntityFilter(
    val page: Int = 0,
    val size: Int = 50,
    val sort: List<Sort> = emptyList(),
)

data class EntityPage(
    val total: Long,
    val page: Int,
    val size: Int,
    val values: List<Map<String,Any>>
)
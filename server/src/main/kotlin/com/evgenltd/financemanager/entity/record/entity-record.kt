package com.evgenltd.financemanager.entity.record

data class EntityRecord(
    val name: String,
    val label: String,
    val fields: List<EntityFieldRecord>,
)

enum class EntityFieldType {
    ID,
    STRING,
    NUMBER,
    BOOLEAN,
    DATE,
    AMOUNT,
    ENUM,
    REFERENCE,
    JSON,
}

data class EntityFieldRecord(
    val name: String,
    val type: EntityFieldType,
    val nullable: Boolean = false,
)

enum class Operator {
    EQUALS,
    GREATER,
    LESS,
    GREATER_OR_EQUALS,
    LESS_OR_EQUALS,
    LIKE,
    IN,
}

data class FilterRecord(val field: String, val negate: Boolean, val operator: Operator, val value: Any)

data class SortRecord(val field: String, val direction: SortDirection)

enum class SortDirection {
    ASC,
    DESC
}

data class EntityFilter(
    val page: Int = 0,
    val size: Int = 50,
    val filter: List<FilterRecord> = emptyList(),
    val sort: List<SortRecord> = emptyList(),
)

data class EntityPage(
    val total: Long,
    val page: Int,
    val size: Int,
    val values: List<Map<String,Any?>>
)
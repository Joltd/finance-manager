package com.evgenltd.financemanager.entity.record

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.metamodel.EntityType
import jakarta.persistence.metamodel.SingularAttribute

data class EntityRecord(
    @JsonIgnore
    val type: EntityType<*>,
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
    @JsonIgnore
    val attribute: SingularAttribute<*,*>,
    val name: String,
    val type: EntityFieldType,
    val nullable: Boolean = false,
    val referenceName: String? = null,
    val enumConstants: List<Any> = emptyList(),
)

enum class EntityFilterOperator {
    EQUALS,
    GREATER,
    GREATER_EQUALS,
    LESS,
    LESS_EQUALS,
    LIKE,
    IN_LIST,
    IS_NULL,
    CURRENCY_IN_LIST,
    AMOUNT_EQUALS,
    AMOUNT_NOT_EQUALS,
    AMOUNT_GREATER,
    AMOUNT_GREATER_EQUALS,
    AMOUNT_LESS,
    AMOUNT_LESS_EQUALS,
}

data class EntityFilterExpressionRecord(
    val field: String,
    val operator: EntityFilterOperator,
    val value: Any?,
)

data class EntityFilterNodeRecord(
    val negate: Boolean,
    val expression: EntityFilterExpressionRecord?,
    val condition: EntityFilterCondition?,
    val children: List<EntityFilterNodeRecord>,
)

data class EntitySortEntryRecord(val field: String, val direction: SortDirection)

enum class SortDirection {
    ASC,
    DESC
}

data class EntityListRequest(
    val page: Int = 0,
    val size: Int = 50,
    val filter: EntityFilterNodeRecord?,
    val sort: List<EntitySortEntryRecord> = emptyList(),
)

data class EntityListPage(
    val total: Long,
    val page: Int,
    val size: Int,
    val values: List<Map<String,Any?>>
)

enum class EntityFilterCondition {
    AND,
    OR,
}
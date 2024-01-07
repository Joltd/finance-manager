package com.evgenltd.financemanager.entity.service

import com.evgenltd.financemanager.common.util.toAmountValue
import com.evgenltd.financemanager.entity.record.*
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Service
import java.math.BigDecimal
import kotlin.random.Random

@Service
class QueryBuilderService(
    private val mapper: ObjectMapper,
) {

//    fun referenceQuery(): String {
//
//    }

    fun selectQuery(
        entity: EntityRecord,
        filter: List<EntityFilterConditionRecord>,
        sort: List<EntitySortEntryRecord>
    ): SelectQuery {

        val fields = entity.fields.associateBy { it.name }

        var filterClause = ""
        var parameters = emptyMap<String, Any?>()
        if (filter.isNotEmpty()) {
            val filterClauses = filter.mapIndexed { index, condition -> condition.toConditionClause(index, fields) }
            filterClause = "where ${filterClauses.joinToString(" and ") { it.clause }}"
            parameters = filterClauses.mapNotNull { it.parameters }.associate { it }
        }

        var orderClause = ""
        if (sort.isNotEmpty()) {
            orderClause = "order by ${sort.joinToString(", ") { "e.${it.field} ${it.direction}" }}"
        }

        return SelectQuery(
            query = "select e from ${entity.name} e $filterClause $orderClause",
            countQuery = "select count(*) from ${entity.name} e $filterClause",
            parameters = parameters
        )
    }

    private fun EntityFilterConditionRecord.toConditionClause(index: Int, fields: Map<String, EntityFieldRecord>): FilterClause {
        val field = fields[field]!!

        val fieldName = field.fieldName(operator)

        val operatorLiteral = OPERATOR_MAPPING[operator]

        if (operator in listOf(EntityFilterOperator.IS_NULL, EntityFilterOperator.IS_NOT_NULL)) {
            return FilterClause(
                clause = "e.$fieldName $operatorLiteral",
                parameters = null
            )
        }

        val actualValue = if (field.type in listOf(EntityFieldType.ID, EntityFieldType.DATE) && operator !in listOf(EntityFilterOperator.IS_NULL, EntityFilterOperator.IS_NOT_NULL)) {
            mapper.readValue("\"$value\"", field.attribute.javaType)
        } else if (field.type == EntityFieldType.ENUM) {
            (value as List<String>).map { mapper.readValue("\"$it\"", field.attribute.javaType) }
        } else if (operator in listOf(EntityFilterOperator.LIKE, EntityFilterOperator.NOT_LIKE)) {
            "%$value%"
        } else if (operator in listOf(EntityFilterOperator.AMOUNT_EQUALS,EntityFilterOperator.AMOUNT_NOT_EQUALS,EntityFilterOperator.AMOUNT_GREATER,EntityFilterOperator.AMOUNT_GREATER_EQUALS,EntityFilterOperator.AMOUNT_LESS,EntityFilterOperator.AMOUNT_LESS_EQUALS)) {
            BigDecimal(value as String).toAmountValue()
        } else {
            value
        }

        val parameterName = field.name + index
        return FilterClause(
            clause = "e.$fieldName $operatorLiteral :$parameterName",
            parameters = parameterName to actualValue
        )
    }

    private fun EntityFieldRecord.fieldName(operator: EntityFilterOperator):String = if (type == EntityFieldType.REFERENCE) {
        "${name}.id"
    } else if (type == EntityFieldType.AMOUNT) {
        if (operator in listOf(EntityFilterOperator.CURRENCY_IN_LIST, EntityFilterOperator.CURRENCY_NOT_IN_LIST)) {
            "${name}.currency"
        } else {
            "${name}.value"
        }
    } else {
        name
    }

    private companion object {
        val OPERATOR_MAPPING = mapOf(
            EntityFilterOperator.EQUALS to "=",
            EntityFilterOperator.NOT_EQUALS to "<>",
            EntityFilterOperator.GREATER to ">",
            EntityFilterOperator.GREATER_EQUALS to ">=",
            EntityFilterOperator.LESS to "<",
            EntityFilterOperator.LESS_EQUALS to "<=",
            EntityFilterOperator.LIKE to "like",
            EntityFilterOperator.NOT_LIKE to "not like",
            EntityFilterOperator.IN_LIST to "in",
            EntityFilterOperator.NOT_IN_LIST to "not in",
            EntityFilterOperator.IS_NULL to "is null",
            EntityFilterOperator.IS_NOT_NULL to "is not null",
            EntityFilterOperator.CURRENCY_IN_LIST to "in",
            EntityFilterOperator.CURRENCY_NOT_IN_LIST to "not in",
            EntityFilterOperator.AMOUNT_EQUALS to "=",
            EntityFilterOperator.AMOUNT_NOT_EQUALS to "<>",
            EntityFilterOperator.AMOUNT_GREATER to ">",
            EntityFilterOperator.AMOUNT_GREATER_EQUALS to ">=",
            EntityFilterOperator.AMOUNT_LESS to "<",
            EntityFilterOperator.AMOUNT_LESS_EQUALS to "<=",
        )
    }

}

data class FilterClause(
    val clause: String,
    val parameters: Pair<String, Any?>?
)
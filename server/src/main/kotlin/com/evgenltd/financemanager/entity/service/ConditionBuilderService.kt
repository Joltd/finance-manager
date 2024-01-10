package com.evgenltd.financemanager.entity.service

import com.evgenltd.financemanager.common.util.toAmountValue
import com.evgenltd.financemanager.entity.record.EntityFieldRecord
import com.evgenltd.financemanager.entity.record.EntityFieldType
import com.evgenltd.financemanager.entity.record.EntityFilterConditionRecord
import com.evgenltd.financemanager.entity.record.EntityFilterOperator
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.Path
import jakarta.persistence.criteria.Predicate
import jakarta.persistence.criteria.Root
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import java.math.BigDecimal

@Service
class ConditionBuilderService(
    private val mapper: ObjectMapper,
) {

    fun <T> build(
        filter: List<EntityFilterConditionRecord>,
        fields: List<EntityFieldRecord>,
        root: Root<T>,
        cb: CriteriaBuilder,
    ): Predicate {
        val fieldIndex = fields.associateBy { it.name }
        return filter.map { it.toPredicate(root, cb, fieldIndex) }
            .let { cb.and(*it.toTypedArray()) }
    }

    fun <T> build(
        filter: List<EntityFilterConditionRecord>,
        fields: List<EntityFieldRecord>,
    ): Specification<T> {
        val fieldIndex = fields.associateBy { it.name }
        return Specification { root, _, cb ->
            filter.map { it.toPredicate(root, cb, fieldIndex) }
                .let { cb.and(*it.toTypedArray()) }
        }
    }

    private fun <T> EntityFilterConditionRecord.toPredicate(root: Root<T>, cb: CriteriaBuilder, fields: Map<String, EntityFieldRecord>): Predicate {
        val field = fields[field]!!

        val fieldPath = field.fieldPath(root, operator)

        val getPredicate = OPERATOR_MAPPING[operator]!!
        return if (operator in listOf(EntityFilterOperator.IS_NULL, EntityFilterOperator.IS_NOT_NULL)) {
            getPredicate(cb, fieldPath, "")
        } else if (value == null) {
            cb.conjunction()
        } else {
            val actualValue = field.actualValue(operator, value)
            getPredicate(cb, fieldPath, actualValue)
        }
    }

    private fun <T> EntityFieldRecord.fieldPath(root: Root<T>, operator: EntityFilterOperator): Path<Any> = if (type == EntityFieldType.REFERENCE) {
        root.get<Any>(name).get("id")
    } else if (type == EntityFieldType.AMOUNT) {
        if (operator in listOf(EntityFilterOperator.CURRENCY_IN_LIST, EntityFilterOperator.CURRENCY_NOT_IN_LIST)) {
            root.get<Any>(name).get("currency")
        } else {
            root.get<Any>(name).get("value")
        }
    } else {
        root.get(name)
    }

    private fun EntityFieldRecord.actualValue(operator: EntityFilterOperator, value: Any): Any =
        if (type in listOf(EntityFieldType.ID, EntityFieldType.DATE) && operator !in listOf(EntityFilterOperator.IS_NULL, EntityFilterOperator.IS_NOT_NULL)) {
            mapper.readValue("\"$value\"", attribute.javaType)
        } else if (type == EntityFieldType.ENUM) {
            (value as List<String>).map { mapper.readValue("\"$it\"", attribute.javaType) }
        } else if (operator in listOf(EntityFilterOperator.AMOUNT_EQUALS, EntityFilterOperator.AMOUNT_NOT_EQUALS, EntityFilterOperator.AMOUNT_GREATER, EntityFilterOperator.AMOUNT_GREATER_EQUALS, EntityFilterOperator.AMOUNT_LESS, EntityFilterOperator.AMOUNT_LESS_EQUALS)) {
            BigDecimal(value as String).toAmountValue()
        } else {
            value
        }

    private companion object {
        val OPERATOR_MAPPING: Map<EntityFilterOperator, (CriteriaBuilder, Path<Any>, Any) -> Predicate> = mapOf(
            EntityFilterOperator.EQUALS to { cb, path, value -> cb.equal(path, value) },
            EntityFilterOperator.NOT_EQUALS to { cb, path, value -> cb.notEqual(path, value) },
            EntityFilterOperator.GREATER to { cb, path, value -> cb.greaterThan(path as Path<Comparable<Any>>, value as Comparable<Any>) },
            EntityFilterOperator.GREATER_EQUALS to { cb, path, value -> cb.greaterThanOrEqualTo(path as Path<Comparable<Any>>, value as Comparable<Any>) },
            EntityFilterOperator.LESS to { cb, path, value -> cb.lessThan(path as Path<Comparable<Any>>, value as Comparable<Any>) },
            EntityFilterOperator.LESS_EQUALS to { cb, path, value -> cb.lessThanOrEqualTo(path as Path<Comparable<Any>>, value as Comparable<Any>) },
            EntityFilterOperator.LIKE to { cb, path, value -> cb.like(path as Path<String>, value as String) },
            EntityFilterOperator.NOT_LIKE to { cb, path, value -> cb.notLike(path as Path<String>, value as String) },
            EntityFilterOperator.IN_LIST to { _, path, value -> path.`in`(value as List<Any>) },
            EntityFilterOperator.NOT_IN_LIST to { cb, path, value -> cb.not(path.`in`(value as List<Any>)) },
            EntityFilterOperator.IS_NULL to { cb, path, _ -> cb.isNull(path) },
            EntityFilterOperator.IS_NOT_NULL to { cb, path, _ -> cb.isNotNull(path) },
            EntityFilterOperator.CURRENCY_IN_LIST to { _, path, value -> path.`in`(value as List<Any>) },
            EntityFilterOperator.CURRENCY_NOT_IN_LIST to { cb, path, value -> cb.not(path.`in`(value as List<Any>)) },
            EntityFilterOperator.AMOUNT_EQUALS to { cb, path, value -> cb.equal(path, value) },
            EntityFilterOperator.AMOUNT_NOT_EQUALS to { cb, path, value -> cb.notEqual(path, value)},
            EntityFilterOperator.AMOUNT_GREATER to { cb, path, value -> cb.greaterThan(path as Path<Comparable<Any>>, value as Comparable<Any>) },
            EntityFilterOperator.AMOUNT_GREATER_EQUALS to { cb, path, value -> cb.greaterThanOrEqualTo(path as Path<Comparable<Any>>, value as Comparable<Any>) },
            EntityFilterOperator.AMOUNT_LESS to { cb, path, value -> cb.lessThan(path as Path<Comparable<Any>>, value as Comparable<Any>) },
            EntityFilterOperator.AMOUNT_LESS_EQUALS to { cb, path, value -> cb.lessThanOrEqualTo(path as Path<Comparable<Any>>, value as Comparable<Any>) },
        )
    }

}
package com.evgenltd.financemanager.entity.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.toAmountValue
import com.evgenltd.financemanager.entity.record.*
import com.evgenltd.financemanager.reference.record.Reference
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.Path
import jakarta.persistence.criteria.Predicate
import jakarta.persistence.criteria.Root
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.util.UUID

@Service
class ConditionBuilderService(
    private val mapper: ObjectMapper,
) {

    fun <T> build(
        filter: EntityFilterNodeRecord,
        fields: List<EntityFieldRecord>,
        root: Root<T>,
        cb: CriteriaBuilder,
    ): Predicate {

        val predicate = if (filter.condition != null) {
            filter.children
                .map { build(it, fields, root, cb) }
                .let {
                    when (filter.condition) {
                        EntityFilterCondition.AND -> cb.and(*it.toTypedArray())
                        EntityFilterCondition.OR -> cb.or(*it.toTypedArray())
                    }
                }
        } else if (filter.expression != null) {
            filter.expression.toPredicate(root, cb, fields.associateBy { it.name })
        } else {
            cb.conjunction()
        }

        return if (filter.negate) {
            cb.not(predicate)
        } else {
            predicate
        }

    }

    private fun <T> EntityFilterExpressionRecord.toPredicate(root: Root<T>, cb: CriteriaBuilder, fields: Map<String, EntityFieldRecord>): Predicate {
        val field = fields[field]!!

        val fieldPath = field.fieldPath(root)

        val getPredicate = OPERATOR_MAPPING[operator]!!
        return if (operator in listOf(EntityFilterOperator.IS_NULL)) {
            getPredicate(cb, fieldPath, "")
        } else if (value == null) {
            cb.conjunction()
        } else {
            val actualValue = field.actualValue(operator, value)
            getPredicate(cb, fieldPath, actualValue)
        }
    }

    private fun <T> EntityFieldRecord.fieldPath(root: Root<T>): Path<Any> = if (type == EntityFieldType.REFERENCE) {
        root.get<Any>(name).get("id")
    } else {
        attributes.fold(root as Path<Any>) { path, attribute -> path.get(attribute.name) }
    }

    private fun EntityFieldRecord.actualValue(operator: EntityFilterOperator, value: Any): Any {
        val attribute = attributes.last()
        val parentAttribute = attributes.takeIf { attributes.size > 1 }?.let { it[it.size - 2] }
        return if (operator == EntityFilterOperator.IN_LIST) {
            if (type == EntityFieldType.REFERENCE) {
                (value as List<Map<String,Any>>)
                    .map { UUID.fromString(it["id"] as String) }
            } else {
                (value as List<String>).map { mapper.readValue("\"$it\"", attribute.javaType) }
            }
        } else if (type in listOf(EntityFieldType.ID, EntityFieldType.DATE) && operator !in listOf(EntityFilterOperator.IS_NULL)) {
            mapper.readValue("\"$value\"", attribute.javaType)
        } else if (parentAttribute?.javaType == Amount::class.java) {
            BigDecimal(value as String).toAmountValue()
        } else {
            value
        }
    }

    private companion object {
        val OPERATOR_MAPPING: Map<EntityFilterOperator, (CriteriaBuilder, Path<Any>, Any) -> Predicate> = mapOf(
            EntityFilterOperator.EQUALS to { cb, path, value -> cb.equal(path, value) },
            EntityFilterOperator.GREATER to { cb, path, value -> cb.greaterThan(path as Path<Comparable<Any>>, value as Comparable<Any>) },
            EntityFilterOperator.GREATER_EQUALS to { cb, path, value -> cb.greaterThanOrEqualTo(path as Path<Comparable<Any>>, value as Comparable<Any>) },
            EntityFilterOperator.LESS to { cb, path, value -> cb.lessThan(path as Path<Comparable<Any>>, value as Comparable<Any>) },
            EntityFilterOperator.LESS_EQUALS to { cb, path, value -> cb.lessThanOrEqualTo(path as Path<Comparable<Any>>, value as Comparable<Any>) },
            EntityFilterOperator.LIKE to { cb, path, value -> cb.like(path as Path<String>, value as String) },
            EntityFilterOperator.IN_LIST to { _, path, value -> path.`in`(value as List<Any>) },
            EntityFilterOperator.IS_NULL to { cb, path, _ -> cb.isNull(path) },
        )
    }

}
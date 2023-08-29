package com.evgenltd.financemanager.common.repository

import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.CriteriaQuery
import jakarta.persistence.criteria.Path
import jakarta.persistence.criteria.Predicate
import jakarta.persistence.criteria.Root
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.findByIdOrNull
import java.time.LocalDate

typealias GetPath<T,E> = Root<E>.() -> Path<T>

typealias Condition<E> = (Root<E>, CriteriaQuery<*>, CriteriaBuilder) -> Predicate?

fun <E> emptyCondition(): Condition<E> = { _, _, _ -> null }

inline fun <reified T,ID> CrudRepository<T, ID>.find(id: ID): T = findByIdOrNull(id)
    ?: throw IllegalArgumentException("${T::class.java.simpleName} [$id] not found")

inline fun <T> JpaSpecificationExecutor<T>.findAllByCondition(
    crossinline block: () -> Condition<T>
): List<T> = findAll { root, query, cb ->
    val condition = block()
    condition(root, query, cb)
}

inline fun <T> JpaSpecificationExecutor<T>.findAllByCondition(
    pageable: Pageable,
    crossinline block: () -> Condition<T>
): Page<T> = findAll(
    { root, query, cb ->
        val condition = block()
        condition(root, query, cb)
    },
    pageable
)

inline infix fun <E> Condition<E>.and(
    crossinline spec: Condition<E>
): Condition<E> = { root, query, cb ->
    val left = this(root, query, cb)
    val right = spec(root, query, cb)
    if (left != null && right != null) {
        cb.and(left, right)
    } else {
        left ?: right ?: cb.conjunction()
    }
}

inline infix fun <E> Condition<E>.or(
    crossinline spec: Condition<E>
): Condition<E> = { root, query, cb ->
    val left = this(root, query, cb)
    val right = spec(root, query, cb)
    if (left != null && right != null) {
        cb.or(left, right)
    } else {
        left ?: right ?: cb.conjunction()
    }
}

private inline fun <T : Comparable<T>, E> compare(
    crossinline get: GetPath<T,E>,
    value: T?,
    crossinline compareFunction: CriteriaBuilder.(Path<T>, T) -> Predicate
): Condition<E> = { root, _, cb ->
    value?.let { cb.compareFunction(get(root), it) } 
        ?: cb.conjunction()
}

infix fun <T : Comparable<T>, E> GetPath<T,E>.eq(value: T?): Condition<E> = compare(this, value, CriteriaBuilder::equal)

infix fun <T : Comparable<T>, E> GetPath<T,E>.notEq(value: T?): Condition<E> = compare(this, value, CriteriaBuilder::notEqual)

infix fun <E> GetPath<String,E>.like(value: String?): Condition<E> = compare(this, value, CriteriaBuilder::like)

infix fun <T : Comparable<T>, E> GetPath<T,E>.gte(value: T?): Condition<E> = compare(this, value, CriteriaBuilder::greaterThanOrEqualTo)

infix fun <T : Comparable<T>, E> GetPath<T,E>.gt(value: T?): Condition<E> = compare(this, value, CriteriaBuilder::greaterThan)

infix fun <T : Comparable<T>, E> GetPath<T,E>.lte(value: T?): Condition<E> = compare(this, value, CriteriaBuilder::lessThanOrEqualTo)

infix fun <T : Comparable<T>, E> GetPath<T,E>.lt(value: T?): Condition<E> = compare(this, value, CriteriaBuilder::lessThan)

infix fun <T : Comparable<T>, E> GetPath<T,E>.inList(values: List<T>?): Condition<E> = { root, _, cb ->
    if (values?.isNotEmpty() == true) {
        this.invoke(root).`in`(values)
    } else {
        cb.conjunction()
    }
}
package com.evgenltd.financemanager.common.repository

import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.CriteriaQuery
import jakarta.persistence.criteria.Path
import jakarta.persistence.criteria.Predicate
import jakarta.persistence.criteria.Root
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.findByIdOrNull
import java.time.LocalDate

typealias GetPath<T,E> = Root<E>.() -> Path<T>

typealias Condition<E> = (Root<E>, CriteriaQuery<*>, CriteriaBuilder) -> Predicate

inline fun <reified T,ID> CrudRepository<T, ID>.find(id: ID): T = findByIdOrNull(id)
    ?: throw IllegalArgumentException("${T::class.java.simpleName} [$id] not found")

inline fun <T> JpaSpecificationExecutor<T>.findAll(
    pageable: Pageable,
    crossinline block: () -> Condition<T>
) = findAll(
    { root, query, cb ->
        root.get<LocalDate>("").`in`(listOf(LocalDate.now()))
        val condition = block()
        condition(root, query, cb)
    },
    pageable
)

inline infix fun <E> Condition<E>.and(
    crossinline spec: Condition<E>
): Condition<E> = { root, query, cb ->
    cb.and(this(root, query, cb), spec(root, query, cb))
}

inline infix fun <E> Condition<E>.or(
    crossinline spec: Condition<E>
): Condition<E> = { root, query, cb ->
    cb.or(this(root, query, cb), spec(root, query, cb))
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

infix fun <T : Comparable<T>, E> GetPath<T,E>.gte(value: T?): Condition<E> = compare(this, value, CriteriaBuilder::greaterThanOrEqualTo)

infix fun <T : Comparable<T>, E> GetPath<T,E>.gt(value: T?): Condition<E> = compare(this, value, CriteriaBuilder::greaterThan)

infix fun <T : Comparable<T>, E> GetPath<T,E>.lte(value: T?): Condition<E> = compare(this, value, CriteriaBuilder::lessThanOrEqualTo)

infix fun <T : Comparable<T>, E> GetPath<T,E>.lt(value: T?): Condition<E> = compare(this, value, CriteriaBuilder::lessThan)

infix fun <T : Comparable<T>, E> GetPath<T,E>.inList(values: List<T>): Condition<E> = { root, _, cb ->
    if (values.isEmpty()) {
        cb.conjunction()
    } else {
        this.invoke(root).`in`(values)
    }
}
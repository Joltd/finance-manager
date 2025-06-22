package com.evgenltd.financemanager.common.record

import org.springframework.data.jpa.domain.Specification
import java.time.LocalDate
import kotlin.reflect.KProperty1

data class Range<T>(val from: T?, val to: T?)

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

fun <T> emptySpecification(): Specification<T> = Specification { _, _, _ -> null }

fun <E, F> valueNonNull(value: F?, block: (value: F) -> Specification<E>): Specification<E> {
    if (value == null) {
        return emptySpecification()
    }

    return block(value)
}

infix fun <T> Specification<T>.and(other: Specification<T>): Specification<T> = this.and(other)

infix fun <T> Specification<T>.or(other: Specification<T>): Specification<T> = this.or(other)

infix fun <E, F : Comparable<F>> KProperty1<E, F>.gte(value: F?): Specification<E> = valueNonNull(value) {
    Specification<E> { root, _, builder ->
        builder.greaterThanOrEqualTo(root.get(name), it)
    }
}

infix fun <E, F : Comparable<F>> KProperty1<E, F>.lt(value: F?): Specification<E> = valueNonNull(value) {
    Specification<E> { root, _, builder ->
        builder.lessThan(root.get(name), it)
    }
}

infix fun <E, F : Comparable<F>> KProperty1<E, F>.between(range: Range<F>?): Specification<E> {
    if (range?.from == null && range?.to == null) {
        return emptySpecification()
    }

    return (this gte range.from) and (this lt range.to)
}


package com.evgenltd.financemanager.common.repository

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.util.Amount
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.util.UUID
import kotlin.reflect.KProperty1

inline fun <reified T,ID> CrudRepository<T, ID>.find(id: ID): T = findByIdOrNull(id)
    ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${T::class.java.simpleName} [$id] not found")

fun <T> emptySpecification(): Specification<T> = Specification { _, _, _ -> null }

fun <E, F> valueNonNull(value: F?, block: (value: F) -> Specification<E>): Specification<E> {
    if (value == null) {
        return emptySpecification()
    }

    return block(value)
}

infix fun <T> Specification<T>.and(other: Specification<T>): Specification<T> = this.and(other)
infix fun <T> Specification<T>.or(other: Specification<T>): Specification<T> = this.or(other)

infix fun <E, F> KProperty1<E, F?>.eq(value: F?): Specification<E> = valueNonNull(value) {
    Specification<E> { root, _, builder ->
        builder.equal(root.get<F>(name), it)
    }
}

fun <E, F> KProperty1<E, F?>.isNull(): Specification<E> = Specification<E> { root, _, builder ->
    builder.isNull(root.get<F>(name))
}

fun <E, F> KProperty1<E, F?>.isNotNull(): Specification<E> = Specification<E> { root, _, builder ->
    builder.isNotNull(root.get<F>(name))
}

infix fun <E> KProperty1<E, String>.like(value: String?): Specification<E> = valueNonNull(value) {
    Specification<E> { root, _, builder ->
        builder.like(builder.lower(root.get(name)), "%${it.lowercase()}%")
    }
}

infix fun <E, F : Comparable<F>> KProperty1<E, F?>.gte(value: F?): Specification<E> = valueNonNull(value) {
    Specification<E> { root, _, builder ->
        builder.greaterThanOrEqualTo(root.get(name), it)
    }
}

infix fun <E, F : Comparable<F>> KProperty1<E, F?>.lt(value: F?): Specification<E> = valueNonNull(value) {
    Specification<E> { root, _, builder ->
        builder.lessThan(root.get(name), it)
    }
}

infix fun <E, F : Comparable<F>> KProperty1<E, F?>.contains(values: Iterable<F>?): Specification<E> = valueNonNull(values) {
    Specification<E> { root, _, builder ->
        builder.`in`(root.get<F>(name)).also { expression ->
            it.onEach { expression.value(it) }
        }
    }
}

infix fun <E, F : Comparable<F>> KProperty1<E, F?>.between(range: Range<F>?): Specification<E> {
    if (range?.from == null && range?.to == null) {
        return emptySpecification()
    }

    return (this gte range.from) and (this lt range.to)
}

// amount

infix fun <E> KProperty1<E, Amount?>.currency(currency: String?): Specification<E> = valueNonNull(currency) {
    Specification<E> { root, _, builder ->
        builder.equal(root.get<Amount>(name).get<String>("currency"), it)
    }
}

fun <E> KProperty1<E, Amount?>.isNotZero(): Specification<E> = Specification<E> { root, _, builder ->
    builder.notEqual(root.get<Amount>(name).get<Long>("value"), 0L)
}

// account

infix fun <E> KProperty1<E, Account?>.account(id: UUID?): Specification<E> = valueNonNull(id) {
    Specification<E> { root, _, builder ->
        builder.equal(root.get<Account>(name).get<String>("id"), it)
    }
}
package com.evgenltd.financemanager.common.repository

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.record.BigDecimalRange
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.badRequestException
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.findByIdOrNull
import java.math.BigDecimal
import java.util.*
import kotlin.reflect.KProperty1

inline fun <reified T : Any,ID : Any> CrudRepository<T, ID>.find(id: ID): T = findByIdOrNull(id)
    ?: throw badRequestException("${T::class.java.simpleName} [$id] not found")

fun <T : Any> emptySpecification(): Specification<T> = Specification { _, _, _ -> null }

fun <E : Any, F : Any> valueNonNull(value: F?, block: (value: F) -> Specification<E>): Specification<E> {
    if (value == null) {
        return emptySpecification()
    }

    return block(value)
}

infix fun <T : Any> Specification<T>.and(other: Specification<T>): Specification<T> = this.and(other)
infix fun <T : Any> Specification<T>.or(other: Specification<T>): Specification<T> = this.or(other)

infix fun <E : Any, F : Any> KProperty1<E, F?>.eq(value: F?): Specification<E> = valueNonNull(value) {
    Specification { root, _, builder ->
        builder.equal(root.get<F>(name), it)
    }
}

fun <E : Any, F : Any> KProperty1<E, F?>.isNull(): Specification<E> = Specification { root, _, builder ->
    builder.isNull(root.get<F>(name))
}

fun <E : Any, F : Any> KProperty1<E, F?>.isNotNull(): Specification<E> = Specification { root, _, builder ->
    builder.isNotNull(root.get<F>(name))
}

infix fun <E : Any> KProperty1<E, String>.like(value: String?): Specification<E> = valueNonNull(value) {
    Specification { root, _, builder ->
        builder.like(builder.lower(root.get(name)), "%${it.lowercase()}%")
    }
}

infix fun <E : Any, F : Comparable<F>> KProperty1<E, F?>.gt(value: F?): Specification<E> = valueNonNull(value) {
    Specification { root, _, builder ->
        builder.greaterThan(root.get(name), it)
    }
}

infix fun <E : Any, F : Comparable<F>> KProperty1<E, F?>.gte(value: F?): Specification<E> = valueNonNull(value) {
    Specification { root, _, builder ->
        builder.greaterThanOrEqualTo(root.get(name), it)
    }
}

infix fun <E : Any, F : Comparable<F>> KProperty1<E, F?>.lt(value: F?): Specification<E> = valueNonNull(value) {
    Specification { root, _, builder ->
        builder.lessThan(root.get(name), it)
    }
}

infix fun <E : Any, F : Comparable<F>> KProperty1<E, F?>.lte(value: F?): Specification<E> = valueNonNull(value) {
    Specification { root, _, builder ->
        builder.lessThanOrEqualTo(root.get(name), it)
    }
}

infix fun <E : Any, F : Comparable<F>> KProperty1<E, F?>.contains(values: Iterable<F>?): Specification<E> = valueNonNull(values) {
    Specification { root, _, builder ->
        builder.`in`(root.get<F>(name))
            .also { expression ->
                it.onEach { expression.value(it) }
            }
    }
}

infix fun <E : Any, F : Comparable<F>> KProperty1<E, F?>.containsNot(values: Iterable<F>?): Specification<E> = valueNonNull(values) {
    Specification<E> { root, _, builder ->
        builder.`in`(root.get<F>(name))
            .also { expression ->
                it.onEach { expression.value(it) }
            }
            .let { builder.not(it) }
    }
}

infix fun <E : Any, F : Comparable<F>> KProperty1<E, F?>.between(range: Range<F>?): Specification<E> {
    if (range?.from == null && range?.to == null) {
        return emptySpecification()
    }

    return (this gte range.from) and (this lt range.to)
}

// amount

infix fun <E : Any> KProperty1<E, Amount?>.currency(currency: String?): Specification<E> = valueNonNull(currency) {
    Specification<E> { root, _, builder ->
        builder.equal(root.get<Amount>(name).get<String>(Amount::currency.name), it)
    }
}

fun <E : Any> KProperty1<E, Amount?>.amountIsNotZero(): Specification<E> = Specification { root, _, builder ->
    builder.notEqual(root.get<Amount>(name).get<BigDecimal>(Amount::value.name), BigDecimal.ZERO)
}

infix fun <E : Any> KProperty1<E, Amount?>.amountGt(value: BigDecimal?): Specification<E> = valueNonNull(value) {
    Specification { root, _, builder ->
        builder.greaterThan(root.get<Amount>(name).get(Amount::value.name), value)
    }
}

infix fun <E : Any> KProperty1<E, Amount?>.amountGte(value: BigDecimal?): Specification<E> = valueNonNull(value) {
    Specification { root, _, builder ->
        builder.greaterThanOrEqualTo(root.get<Amount>(name).get(Amount::value.name), value)
    }
}

infix fun <E : Any> KProperty1<E, Amount?>.amountLt(value: BigDecimal?): Specification<E> = valueNonNull(value) {
    Specification { root, _, builder ->
        builder.lessThan(root.get<Amount>(name).get(Amount::value.name), value)
    }
}

infix fun <E : Any> KProperty1<E, Amount?>.amountLte(value: BigDecimal?): Specification<E> = valueNonNull(value) {
    Specification { root, _, builder ->
        builder.lessThanOrEqualTo(root.get<Amount>(name).get(Amount::value.name), value)
    }
}

infix fun <E : Any> KProperty1<E, Amount?>.amountBetween(range: BigDecimalRange?): Specification<E> {
    if (range?.from == null && range?.to == null) {
        return emptySpecification()
    }

    return (this amountGte range.from) and (this amountLt range.to)
}

// account

infix fun <E : Any> KProperty1<E, Account?>.account(id: UUID?): Specification<E> = valueNonNull(id) { value ->
    Specification { root, _, builder ->
        root.get<Account>(name)
            .get<String>(Account::id.name)
            .let { builder.equal(it, value) }
    }
}

infix fun <E : Any> KProperty1<E, Account?>.accounts(accounts: List<UUID>?): Specification<E> = valueNonNull(accounts) { value ->
    Specification { root, _, _ ->
        root.get<Account>(name)
            .get<UUID>(Account::id.name)
            .`in`(value)
    }
}

infix fun <E : Any> KProperty1<E, Account?>.accountsNot(accounts: List<UUID>?): Specification<E> = valueNonNull(accounts) { value ->
    Specification { root, _, builder ->
        root.get<Account>(name).get<UUID>(Account::id.name)
            .`in`(value)
            .let { builder.not(it) }
    }
}

infix fun <E : Any> KProperty1<E, Account?>.accountTypes(types: List<AccountType>?): Specification<E> = valueNonNull(types) { value ->
    Specification { root, _, _ ->
        root.get<Account>(name)
            .get<AccountType>(Account::type.name)
            .`in`(value)
    }
}
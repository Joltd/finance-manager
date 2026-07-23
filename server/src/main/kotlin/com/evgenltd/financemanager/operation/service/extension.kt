package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.common.repository.account
import com.evgenltd.financemanager.common.repository.accounts
import com.evgenltd.financemanager.common.repository.accountsNot
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.currency
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.or
import com.evgenltd.financemanager.common.repository.valueNonNull
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.Operational
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.entity.TransactionType
import com.evgenltd.financemanager.tag.entity.Tag
import org.springframework.data.jpa.domain.Specification
import java.util.*

fun Transaction.signedAmount(): Amount = if (type == TransactionType.OUT) -amount else amount

fun byAccount(account: Account): Specification<Operation> =
    (Operation::accountFrom eq account) or (Operation::accountTo eq account)

fun byCurrency(currency: String?): Specification<Operation> =
    (Operation::amountFrom currency currency) or (Operation::amountTo currency currency)

fun byIncludeAccounts(ids: List<UUID>?): Specification<Operation> =
    (Operation::accountFrom accounts ids) or (Operation::accountTo accounts ids)

fun byExcludeAccounts(ids: List<UUID>?): Specification<Operation> =
    (Operation::accountFrom accountsNot ids) and (Operation::accountTo accountsNot ids)

fun byIncludeTags(ids: List<UUID>?): Specification<Operation> = valueNonNull(ids) { value ->
    Specification { root, query, _ ->
        query.distinct(true)
        root.join<Operation, Tag>(Operation::tags.name).get<UUID>(Tag::id.name).`in`(value)
    }
}

fun byExcludeTags(ids: List<UUID>?): Specification<Operation> = valueNonNull(ids) { value ->
    Specification { root, query, builder ->
        val subquery = query.subquery(UUID::class.java)
        val subRoot = subquery.from(Operation::class.java)
        val tagJoin = subRoot.join<Operation, Tag>(Operation::tags.name)
        subquery.select(subRoot.get(Operation::id.name))
            .where(
                builder.equal(subRoot.get<UUID>(Operation::id.name), root.get<UUID>(Operation::id.name)),
                tagJoin.get<UUID>(Tag::id.name).`in`(value),
            )
        builder.not(builder.exists(subquery))
    }
}

fun List<Operational>.amountsForAccount(account: Account): List<Amount> = flatMap { operation ->
    listOf(
        operation.amountFrom.takeIf { operation.accountFrom == account }?.let { -it },
        operation.amountTo.takeIf { operation.accountTo == account },
    )
}.filterNotNull()
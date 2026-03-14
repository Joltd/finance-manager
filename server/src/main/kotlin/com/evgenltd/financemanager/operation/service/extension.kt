package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.common.repository.account
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.or
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.Operational
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.entity.TransactionType
import org.springframework.data.jpa.domain.Specification
import java.util.*

fun Transaction.signedAmount(): Amount = if (type == TransactionType.OUT) -amount else amount

fun byAccount(account: Account): Specification<Operation> =
    (Operation::accountFrom eq account) or (Operation::accountTo eq account)

fun byAccount(account: UUID?): Specification<Operation> =
    (Operation::accountFrom account account) or (Operation::accountTo account account)

fun List<Operational>.amountsForAccount(account: Account): List<Amount> = flatMap { operation ->
    listOf(
        operation.amountFrom.takeIf { operation.accountFrom == account }?.let { -it },
        operation.amountTo.takeIf { operation.accountTo == account },
    )
}.filterNotNull()
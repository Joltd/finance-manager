package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.or
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.entity.TransactionType
import com.evgenltd.financemanager.account.entity.Account
import org.springframework.data.jpa.domain.Specification

fun Transaction.signedAmount(): Amount = if (type == TransactionType.OUT) -amount else amount

fun byAccount(account: Account): Specification<Operation> =
    (Operation::accountFrom eq account) or (Operation::accountTo eq account)

fun isTransactionDataChanged(old: Operation?, new: Operation?): Boolean =
    old?.date != new?.date ||
            old?.type != new?.type ||
            old?.amountFrom != new?.amountFrom ||
            old?.accountFrom != new?.accountFrom ||
            old?.amountTo != new?.amountTo ||
            old?.accountTo != new?.accountTo
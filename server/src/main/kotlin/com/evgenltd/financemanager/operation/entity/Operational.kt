package com.evgenltd.financemanager.operation.entity

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate

interface Operational {
    val date: LocalDate
    val type: OperationType
    val amountFrom: Amount
    val accountFrom: Account?
    val amountTo: Amount
    val accountTo: Account?
}
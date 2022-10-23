package com.evgenltd.financemanager.document.record

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate

class DocumentExchangeRecord(
        val id: String?,
        val date: LocalDate,
        val description: String,
        val accountFrom: String,
        val amountFrom: Amount,
        val accountTo: String,
        val amountTo: Amount,
        val commissionExpenseCategory: String,
        val commissionAmount: Amount
) : DocumentRecord
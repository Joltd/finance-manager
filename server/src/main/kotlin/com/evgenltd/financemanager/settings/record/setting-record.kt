package com.evgenltd.financemanager.settings.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.common.record.Reference
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

data class ApplicationSettings(
    val version: String,
    val operationDefaultCurrency: String?,
    val operationDefaultAccount: AccountRecord?,
    val operationCashAccount: AccountRecord?,
    val candyIncomeAmount: Amount?,
    val candyIncomeFrequencyValue: Long?,
    val candyIncomeFrequencyUnit: ChronoUnit?,
    val turnoverLastUpdate: LocalDateTime?,
)

data class UpdateApplicationSettings(
    val operationDefaultCurrency: String?,
    val operationDefaultAccount: Reference?,
    val operationCashAccount: Reference?,
    val candyIncomeAmount: Amount?,
    val candyIncomeFrequencyValue: Long?,
    val candyIncomeFrequencyUnit: ChronoUnit?,
    val turnoverLastUpdate: LocalDateTime?,
)
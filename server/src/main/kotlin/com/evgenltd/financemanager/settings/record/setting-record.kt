package com.evgenltd.financemanager.settings.record

import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.common.record.Reference

data class ApplicationSettings(
    val version: String,
    val operationDefaultCurrency: String?,
    val operationDefaultAccount: AccountRecord?,
    val operationCashAccount: AccountRecord?,
)

data class UpdateApplicationSettings(
    val operationDefaultCurrency: String?,
    val operationDefaultAccount: Reference?,
    val operationCashAccount: Reference?,
)
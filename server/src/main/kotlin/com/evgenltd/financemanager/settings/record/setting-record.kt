package com.evgenltd.financemanager.settings.record

import com.evgenltd.financemanager.account.record.AccountReferenceRecord

data class SettingsRecord(
    val version: String,
    val operationDefaultCurrency: String?,
    val operationDefaultAccount: AccountReferenceRecord?,
    val operationCashAccount: AccountReferenceRecord?,
)

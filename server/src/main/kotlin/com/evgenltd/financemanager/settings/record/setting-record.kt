package com.evgenltd.financemanager.settings.record

import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.account.record.AccountReferenceRecord
import com.evgenltd.financemanager.common.record.Reference

data class SettingRecord(
    val version: String,
    val operationDefaultCurrency: String?,
    val operationDefaultAccount: AccountReferenceRecord?,
    val operationCashAccount: AccountReferenceRecord?,
)

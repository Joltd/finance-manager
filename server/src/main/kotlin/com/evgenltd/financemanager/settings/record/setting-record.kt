package com.evgenltd.financemanager.settings.record

import com.evgenltd.financemanager.reference.record.Reference

data class ApplicationSettings(
    val version: String,
    val operationDefaultCurrency: String?,
    val operationDefaultAccount: Reference?,
    val operationCashAccount: Reference?
)

data class UpdateApplicationSettings(
    val operationDefaultCurrency: String?,
    val operationDefaultAccount: Reference?,
    val operationCashAccount: Reference?
)
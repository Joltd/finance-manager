package com.evgenltd.financemanager.settings.record

data class SettingsRecord(
        val currencies: List<String>,
        val fastExpense: FastExpenseRecord
)
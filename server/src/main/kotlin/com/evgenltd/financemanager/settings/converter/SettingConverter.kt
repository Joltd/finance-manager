package com.evgenltd.financemanager.settings.converter

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.converter.CurrencyConverter
import com.evgenltd.financemanager.settings.entity.Settings
import com.evgenltd.financemanager.settings.record.SettingsRecord
import org.springframework.stereotype.Service

@Service
class SettingConverter(
    private val currencyConverter: CurrencyConverter,
    private val accountConverter: AccountConverter,
) {

    fun toRecord(settings: Settings): SettingsRecord = SettingsRecord(
        version = settings.version,
        operationDefaultCurrency = settings.operationDefaultCurrency?.name,
        operationDefaultAccount = settings.operationDefaultAccount?.let { accountConverter.toReference(it) },
        operationCashAccount = settings.operationCashAccount?.let { accountConverter.toReference(it) },
    )

    fun toEntity(settingsRecord: SettingsRecord): Settings = Settings(
        version = settingsRecord.version,
        operationDefaultCurrency = settingsRecord.operationDefaultCurrency?.let { currencyConverter.toEntity(it) },
        operationDefaultAccount = settingsRecord.operationDefaultAccount?.let { accountConverter.toEntity(it) },
        operationCashAccount = settingsRecord.operationCashAccount?.let { accountConverter.toEntity(it) },
    )

}
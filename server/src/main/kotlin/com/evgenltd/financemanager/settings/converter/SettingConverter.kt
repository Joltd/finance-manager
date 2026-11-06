package com.evgenltd.financemanager.settings.converter

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.converter.CurrencyConverter
import com.evgenltd.financemanager.settings.entity.Settings
import com.evgenltd.financemanager.settings.record.AdminSettingsRecord
import com.evgenltd.financemanager.settings.record.SettingsRecord
import org.springframework.stereotype.Service

@Service
class SettingConverter(
    private val currencyConverter: CurrencyConverter,
    private val accountConverter: AccountConverter,
) {

    fun toRecord(settings: Settings): SettingsRecord = SettingsRecord(
        version = settings.version,
        operationDefaultCurrencyScale = settings.operationDefaultCurrencyScale,
        operationDefaultCurrency = settings.operationDefaultCurrency?.name,
        operationDefaultAccount = settings.operationDefaultAccount?.let { accountConverter.toAccountReference(it) },
        operationCashAccount = settings.operationCashAccount?.let { accountConverter.toAccountReference(it) },
        pricingFeature = settings.pricingFeature,
    )

    fun toAdminRecord(settings: Settings): AdminSettingsRecord = AdminSettingsRecord(
        pricingFeature = settings.pricingFeature,
    )

    fun fillEntity(settings: Settings, record: SettingsRecord) {
        settings.operationDefaultCurrencyScale = record.operationDefaultCurrencyScale
        settings.operationDefaultCurrency = record.operationDefaultCurrency?.let { currencyConverter.toEntity(it) }
        settings.operationDefaultAccount = record.operationDefaultAccount?.let { accountConverter.toEntity(it) }
        settings.operationCashAccount = record.operationCashAccount?.let { accountConverter.toEntity(it) }
    }

    fun fillEntity(settings: Settings, record: AdminSettingsRecord) {
        record.pricingFeature?.let { settings.pricingFeature = it }
    }

}

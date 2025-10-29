package com.evgenltd.financemanager.settings.entity

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.Currency
import com.evgenltd.financemanager.exchangerate.service.provider.Provider

data class Settings(
    var version: String = "0.0.0",
    @property:SettingName("operation.default.currency")
    var operationDefaultCurrency: Currency? = null,
    @property:SettingName("operation.default.account")
    var operationDefaultAccount: Account? = null,
    @property:SettingName("operation.cash.account")
    var operationCashAccount: Account? = null,
)

data class SystemSettings(
    var version: String = "0.0.0",
    @property:SettingName("fiat.exchange.rate.provider")
    var fiatExchangeRateProvider: Provider? = null,
    @property:SettingName("crypto.exchange.rate.provider")
    var cryptoExchangeRateProvider: Provider? = null,
)

@Target(AnnotationTarget.PROPERTY)
@Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
annotation class SettingName(val name: String)
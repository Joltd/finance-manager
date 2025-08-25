package com.evgenltd.financemanager.settings.service

import com.evgenltd.financemanager.exchangerate.service.provider.Provider
import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.service.AccountService
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.settings.entity.Setting
import com.evgenltd.financemanager.settings.record.SettingRecord
import com.evgenltd.financemanager.settings.repository.SettingRepository
import jakarta.transaction.Transactional
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.*

@Service
@SkipLogging
class SettingService(
    private val settingRepository: SettingRepository,
    private val accountService: AccountService,
    private val accountConverter: AccountConverter,
    @Value("\${APP_VERSION}") private val version: String
) {

    fun operationDefaultCurrency(): String? = getSetting(OPERATION_DEFAULT_CURRENCY)

    fun operationDefaultAccount(): Account? = getSetting(OPERATION_DEFAULT_ACCOUNT)
        ?.let { accountService.byIdOrNull(UUID.fromString(it)) }

    fun operationCashAccount(): Account? = getSetting(OPERATION_CASH_ACCOUNT)
        ?.let { accountService.byIdOrNull(UUID.fromString(it)) }

    fun fiatExchangeRateProvider(): Provider? = getSetting(FIAT_EXCHANGE_RATE_PROVIDER)?.let { Provider.valueOf(it) }

    fun cryptoExchangeRateProvider(): Provider? = getSetting(CRYPTO_EXCHANGE_RATE_PROVIDER)?.let { Provider.valueOf(it) }

    fun load(): SettingRecord = SettingRecord(
        version = version,
        operationDefaultCurrency = operationDefaultCurrency(),
        operationDefaultAccount = operationDefaultAccount()?.let { accountConverter.toReference(it) },
        operationCashAccount = operationCashAccount()?.let { accountConverter.toReference(it) },
    )

    @Transactional
    fun update(request: SettingRecord) {
        updateSetting(OPERATION_DEFAULT_CURRENCY, request.operationDefaultCurrency)
        updateSetting(OPERATION_DEFAULT_ACCOUNT, request.operationDefaultAccount?.id?.toString())
        updateSetting(OPERATION_CASH_ACCOUNT, request.operationCashAccount?.id?.toString())
    }

    private fun getSetting(name: String): String? = settingRepository.findByName(name)?.value

    private fun updateSetting(name: String, value: String?) {
        val setting = settingRepository.findByName(name)
            ?.also { it.value = value }
            ?: Setting(null, name, value)
        settingRepository.save(setting)
    }

    companion object {
        const val OPERATION_DEFAULT_CURRENCY = "operation.default.currency"
        const val OPERATION_DEFAULT_ACCOUNT = "operation.default.account"
        const val OPERATION_CASH_ACCOUNT = "operation.cash.account"
        const val FIAT_EXCHANGE_RATE_PROVIDER = "fiat.exchange.rate.provider"
        const val CRYPTO_EXCHANGE_RATE_PROVIDER = "crypto.exchange.rate.provider"
    }

}
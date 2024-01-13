package com.evgenltd.financemanager.settings.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.fromFractionalString
import com.evgenltd.financemanager.reference.converter.AccountConverter
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.service.AccountService
import com.evgenltd.financemanager.settings.entity.Setting
import com.evgenltd.financemanager.settings.record.ApplicationSettings
import com.evgenltd.financemanager.settings.record.UpdateApplicationSettings
import com.evgenltd.financemanager.settings.repository.SettingRepository
import jakarta.transaction.Transactional
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.temporal.ChronoUnit
import java.util.*

@Service
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

    fun candyIncomeAmount(): Amount? = getSetting(CANDY_INCOME_AMOUNT)
        ?.toLongOrNull()
        ?.let { Amount(it, "USD") }

    fun candyIncomeFrequencyValue(): Long? = getSetting(CANDY_INCOME_FREQUENCY_VALUE)?.toLongOrNull()

    fun candyIncomeFrequencyUnit(): ChronoUnit? = getSetting(CANDY_INCOME_FREQUENCY_UNIT)?.let { ChronoUnit.valueOf(it) }

    fun load(): ApplicationSettings = ApplicationSettings(
        version = version,
        operationDefaultCurrency = operationDefaultCurrency(),
        operationDefaultAccount = operationDefaultAccount()?.let { accountConverter.toReference(it) },
        operationCashAccount = operationCashAccount()?.let { accountConverter.toReference(it) },
        candyIncomeAmount = candyIncomeAmount(),
        candyIncomeFrequencyValue = candyIncomeFrequencyValue(),
        candyIncomeFrequencyUnit = candyIncomeFrequencyUnit(),
    )

    @Transactional
    fun update(request: UpdateApplicationSettings) {
        updateSetting(OPERATION_DEFAULT_CURRENCY, request.operationDefaultCurrency)
        updateSetting(OPERATION_DEFAULT_ACCOUNT, request.operationDefaultAccount?.id?.toString())
        updateSetting(OPERATION_CASH_ACCOUNT, request.operationCashAccount?.id?.toString())
        updateSetting(CANDY_INCOME_AMOUNT, request.candyIncomeAmount?.value?.toString())
        updateSetting(CANDY_INCOME_FREQUENCY_VALUE, request.candyIncomeFrequencyValue?.toString())
        updateSetting(CANDY_INCOME_FREQUENCY_UNIT, request.candyIncomeFrequencyUnit?.name)
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
        const val CANDY_INCOME_AMOUNT = "candy.income.amount"
        const val CANDY_INCOME_FREQUENCY_VALUE = "candy.income.frequency.value"
        const val CANDY_INCOME_FREQUENCY_UNIT = "candy.income.frequency.unit"
    }

}
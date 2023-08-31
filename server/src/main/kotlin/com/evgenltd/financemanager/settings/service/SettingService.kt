package com.evgenltd.financemanager.settings.service

import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.record.toReference
import com.evgenltd.financemanager.reference.service.AccountService
import com.evgenltd.financemanager.settings.entity.Setting
import com.evgenltd.financemanager.settings.record.ApplicationSettings
import com.evgenltd.financemanager.settings.record.UpdateApplicationSettings
import com.evgenltd.financemanager.settings.repository.SettingRepository
import jakarta.transaction.Transactional
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.*

@Service
class SettingService(
    private val settingRepository: SettingRepository,
    private val accountService: AccountService,
    @Value("\${APP_VERSION}") private val version: String
) {

    fun operationDefaultCurrency(): String? = getSetting(OPERATION_DEFAULT_CURRENCY)

    fun operationDefaultAccount(): Account? = getSetting(OPERATION_DEFAULT_ACCOUNT)
        ?.let { accountService.byIdOrNull(UUID.fromString(it)) }

    fun operationCashAccount(): Account? = getSetting(OPERATION_CASH_ACCOUNT)
        ?.let { accountService.byIdOrNull(UUID.fromString(it)) }

    fun load(): ApplicationSettings = ApplicationSettings(
        version = version,
        operationDefaultCurrency = operationDefaultCurrency(),
        operationDefaultAccount = operationDefaultAccount()?.toReference(),
        operationCashAccount = operationCashAccount()?.toReference(),
    )

    @Transactional
    fun update(request: UpdateApplicationSettings) {
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
    }

}
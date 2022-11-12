package com.evgenltd.financemanager.settings.service

import com.evgenltd.financemanager.importexport.service.ImportDataService
import com.evgenltd.financemanager.settings.entity.Setting
import com.evgenltd.financemanager.settings.record.FastExpenseRecord
import com.evgenltd.financemanager.settings.record.SettingsRecord
import com.evgenltd.financemanager.settings.repository.SettingRepository
import org.springframework.data.mongodb.MongoDatabaseFactory
import org.springframework.stereotype.Service
import javax.annotation.PostConstruct

@Service
class SettingsService(
        private val settingRepository: SettingRepository,
        private val mongoDatabaseFactory: MongoDatabaseFactory,
        private val importDataService: ImportDataService
) {

    @PostConstruct
    fun postConstruct() {
        val settings = load()
        if (settings.currencies.isEmpty()) {
            saveDefaultCurrencies()
        }
    }

    fun load(): SettingsRecord {
        val settings = settingRepository.findAll().associateBy { it.name }
        return SettingsRecord(
                settings[CURRENCIES]?.list() ?: emptyList(),
                FastExpenseRecord(
                        settings[FAST_EXPENSE_ACCOUNT]?.value,
                        settings[FAST_EXPENSE_CURRENCY]?.value
                )
        )
    }

    fun update(settings: SettingsRecord) {
        updateList(CURRENCIES, settings.currencies)
        updateSetting(FAST_EXPENSE_ACCOUNT, settings.fastExpense.account)
        updateSetting(FAST_EXPENSE_CURRENCY, settings.fastExpense.currency)
    }

    fun clearDatabase() {
        mongoDatabaseFactory.mongoDatabase.drop()
        saveDefaultCurrencies()
        importDataService.deleteAllFiles()
    }

    private fun saveDefaultCurrencies() {
        updateList(CURRENCIES, listOf("RUB", "USD", "EUR", "KZT", "TRY", "RSD", "USDT", "TRX"))
    }

    private fun updateSetting(name: String, value: String?) {
        settingRepository.deleteByName(name)
        settingRepository.save(Setting(name, value))
    }

    private fun updateList(name: String, value: List<String>) {
        updateSetting(name, value.joinToString(LIST_VALUE_SEPARATOR))
    }

    private fun Setting.list(): List<String> = value?.split(LIST_VALUE_SEPARATOR) ?: emptyList()

    private companion object {
        const val LIST_VALUE_SEPARATOR = ","
        const val CURRENCIES = "currencies"
        const val FAST_EXPENSE_ACCOUNT = "fast.expense.account"
        const val FAST_EXPENSE_CURRENCY = "fast.expense.currency"
    }

}
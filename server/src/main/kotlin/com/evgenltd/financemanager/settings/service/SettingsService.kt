package com.evgenltd.financemanager.settings.service

import com.evgenltd.financemanager.settings.record.SettingsRecord
import com.evgenltd.financemanager.settings.repository.SettingRepository
import org.springframework.stereotype.Service
import javax.annotation.PostConstruct

@Service
class SettingsService(
        private val settingRepository: SettingRepository
) {

    private lateinit var settings: SettingsRecord

    @PostConstruct
    fun postConstruct() {
        val settings = settingRepository.findAll().associateBy { it.name }
        this.settings = SettingsRecord(
                listOf(
                        "RUB", "USD", "EUR",
                        "KZT", "TRY", "RSD",
                        "USDT", "TRX"
                )
        )
    }

    fun settings(): SettingsRecord = settings

}
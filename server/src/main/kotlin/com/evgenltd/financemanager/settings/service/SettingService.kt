package com.evgenltd.financemanager.settings.service

import com.evgenltd.financemanager.settings.entity.Setting
import com.evgenltd.financemanager.settings.record.FastExpenseRecord
import com.evgenltd.financemanager.settings.record.SettingRecord
import com.evgenltd.financemanager.settings.repository.SettingRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service

@Service
class SettingService(
    private val settingRepository: SettingRepository
) {

    fun load(): List<SettingRecord> = settingRepository.findAll().map { it.toRecord() }

    @Transactional
    fun update(setting: SettingRecord) {
        settingRepository.deleteByName(setting.name)
        settingRepository.save(setting.toEntity())
    }

    private fun Setting.toRecord(): SettingRecord = SettingRecord(
        name = name,
        value = value
    )

    private fun SettingRecord.toEntity(): Setting = Setting(
        name = name,
        value = value
    )

}
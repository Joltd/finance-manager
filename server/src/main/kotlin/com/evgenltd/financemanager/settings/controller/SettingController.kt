package com.evgenltd.financemanager.settings.controller

import com.evgenltd.financemanager.settings.record.SettingRecord
import com.evgenltd.financemanager.settings.service.SettingService
import org.springframework.web.bind.annotation.*

@RestController
class SettingController(
    private val settingService: SettingService
) {

    @GetMapping("/settings")
    fun load(): List<SettingRecord> = settingService.load()

    @PostMapping("/settings")
    fun update(@RequestBody record: SettingRecord) = settingService.update(record)

    @DeleteMapping("/settings/database")
    fun clearDatabase() {}

}
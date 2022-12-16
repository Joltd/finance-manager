package com.evgenltd.financemanager.settings.controller

import com.evgenltd.financemanager.settings.record.SettingsRecord
import com.evgenltd.financemanager.settings.service.SettingsService
import org.springframework.web.bind.annotation.*

@RestController
class SettingsController(
        private val settingsService: SettingsService
) {

    @GetMapping("/settings")
    fun load(): SettingsRecord = settingsService.load()

    @PostMapping("/settings")
    fun update(@RequestBody record: SettingsRecord) = settingsService.update(record)

    @DeleteMapping("/settings/database")
    fun clearDatabase() = settingsService.clearDatabase()

}
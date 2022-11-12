package com.evgenltd.financemanager.settings.controller

import com.evgenltd.financemanager.settings.record.SettingsRecord
import com.evgenltd.financemanager.settings.service.SettingsService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

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
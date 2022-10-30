package com.evgenltd.financemanager.settings.controller

import com.evgenltd.financemanager.settings.record.SettingsRecord
import com.evgenltd.financemanager.settings.service.SettingsService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class SettingsController(
        private val settingsService: SettingsService
) {

    @GetMapping("/settings")
    fun load(): SettingsRecord = settingsService.settings()

}
package com.evgenltd.financemanager.settings.controller

import com.evgenltd.financemanager.settings.record.ApplicationSettings
import com.evgenltd.financemanager.settings.service.SettingService
import org.springframework.web.bind.annotation.*

@RestController
class SettingController(
    private val settingService: SettingService
) {

    @GetMapping("/setting")
    fun setting(): ApplicationSettings = settingService.load()

    @PostMapping("/setting")
    fun setting(@RequestBody request: ApplicationSettings) = settingService.update(request)

}
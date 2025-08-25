package com.evgenltd.financemanager.settings.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.settings.record.SettingRecord
import com.evgenltd.financemanager.settings.service.SettingService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
@DataResponse
@SkipLogging
class SettingController(
    private val settingService: SettingService
) {

    @GetMapping("/setting")
    fun setting(): SettingRecord = settingService.load()

    @PostMapping("/setting")
    fun setting(@RequestBody request: SettingRecord) = settingService.update(request)

}
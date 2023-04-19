package com.evgenltd.financemanager.settings.controller

import com.evgenltd.financemanager.settings.record.SettingsRecord
import com.evgenltd.financemanager.settings.service.SettingsService
import com.evgenltd.financemanager.transaction.service.FundGraphService
import org.springframework.web.bind.annotation.*

@RestController
class SettingsController(
    private val settingsService: SettingsService,
    private val fundGraphService: FundGraphService
) {

    @GetMapping("/settings")
    fun load(): SettingsRecord = settingsService.load()

    @PostMapping("/settings")
    fun update(@RequestBody record: SettingsRecord) = settingsService.update(record)

    @DeleteMapping("/settings/database")
    fun clearDatabase() = settingsService.clearDatabase()

    @PostMapping("/settings/graph")
    fun rebuildGraph() = fundGraphService.resetAndRebuildGraph()

}
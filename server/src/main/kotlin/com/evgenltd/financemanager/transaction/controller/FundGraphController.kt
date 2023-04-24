package com.evgenltd.financemanager.transaction.controller

import com.evgenltd.financemanager.transaction.service.FundGraphService
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class FundGraphController(private val fundGraphService: FundGraphService) {

    @PatchMapping("/fund-graph")
    fun rebuildGraph() = fundGraphService.startRebuildGraph()

    @PostMapping("/fund-graph")
    fun resetAndRebuild() = fundGraphService.startResetAndRebuildGraph()

}
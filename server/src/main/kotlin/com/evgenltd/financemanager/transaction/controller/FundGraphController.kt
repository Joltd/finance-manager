package com.evgenltd.financemanager.transaction.controller

import com.evgenltd.financemanager.transaction.record.GraphStateRecord
import com.evgenltd.financemanager.transaction.service.FundGraphService
import com.evgenltd.financemanager.transaction.service.GraphStateService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
class FundGraphController(
    private val graphStateService: GraphStateService,
    private val fundGraphService: FundGraphService
) {

    @GetMapping("/fund-graph")
    fun graphState(): GraphStateRecord = graphStateService.loadState()

    @PatchMapping("/fund-graph")
    fun rebuildGraph() = fundGraphService.startRebuildGraph()

    @DeleteMapping("/fund-graph/{date}")
    fun resetGraph(
        @PathVariable("date")
        @DateTimeFormat(pattern = "yyyy-MM-dd")
        date: LocalDate
    ) = fundGraphService.resetGraph(date)

}


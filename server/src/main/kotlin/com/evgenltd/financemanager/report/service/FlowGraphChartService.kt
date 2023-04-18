package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.report.record.FlowGraphChartRecord
import com.evgenltd.financemanager.report.record.FlowGraphChartSettingsRecord
import com.evgenltd.financemanager.transaction.service.FundGraphService
import org.springframework.stereotype.Service

@Service
class FlowGraphChartService(private val fundGraphService: FundGraphService) {

    fun load(record: FlowGraphChartSettingsRecord): FlowGraphChartRecord {
        return fundGraphService.loadGraph(record.dateFrom, record.dateTo)
    }

}
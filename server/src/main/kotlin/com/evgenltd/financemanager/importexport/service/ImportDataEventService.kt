package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.component.SseEventMapping
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

@Service
class ImportDataEventService(
    private val importDataService: ImportDataService,
) {

    @SseEventMapping("/api/v1/import-data/{id}")
    fun importData(id: UUID): ImportDataRecord = importDataService.get(id)

    @SseEventMapping("/api/v1/import-data/{id}/entry")
    fun importDataEntry(id: UUID, dates: List<LocalDate>): List<LocalDate> = dates

}

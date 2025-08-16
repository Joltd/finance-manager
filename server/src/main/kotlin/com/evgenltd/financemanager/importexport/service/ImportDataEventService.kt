package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.component.Patch
import com.evgenltd.financemanager.common.component.SseEventMapping
import com.evgenltd.financemanager.common.component.patch
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.*

@Service
class ImportDataEventService(
    private val importDataService: ImportDataService,
) {

    @SseEventMapping("/import-data/{id}")
    fun importData(id: UUID): Patch {
        val importData = importDataService.get(id)
        return patch(importData)
    }

    @SseEventMapping("/import-data/{id}")
    fun importDataProgress(id: UUID, progress: Boolean): Patch = patch(progress, "/progress")

    @SseEventMapping("/import-data/{id}/entry")
    fun importDataEntry(id: UUID, dates: List<LocalDate>): List<LocalDate> = dates

}
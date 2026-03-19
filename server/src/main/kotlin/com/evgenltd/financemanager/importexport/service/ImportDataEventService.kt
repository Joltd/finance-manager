package com.evgenltd.financemanager.importexport.service

import org.springframework.stereotype.Service

@Service
class ImportDataEventService(
    private val importDataService: ImportDataService,
) {
//    @SseEventMapping("/api/v1/import-data")
//    fun importData() {}
//
//    @SseEventMapping("/api/v1/import-data/{id}")
//    fun importData(id: UUID): ImportDataRecord = importDataService.get(id)
//
//    @SseEventMapping("/api/v1/import-data/{id}")
//    fun importDataProgress(id: UUID, progress: Boolean): ImportDataProgressPayload = ImportDataProgressPayload(id, progress)
//
//    @SseEventMapping("/api/v1/import-data/{id}/entry")
//    fun importDataEntry(id: UUID, dates: List<LocalDate>): List<LocalDate> = dates
//
//    data class ImportDataProgressPayload(
//        val id: UUID,
//        val progress: Boolean,
//    )

}
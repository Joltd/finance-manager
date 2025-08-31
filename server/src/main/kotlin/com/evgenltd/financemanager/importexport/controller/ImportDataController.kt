package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.record.EntryFilter
import com.evgenltd.financemanager.importexport.record.ImportDataCreateRequest
import com.evgenltd.financemanager.importexport.record.ImportDataEntryGroupRecord
import com.evgenltd.financemanager.importexport.record.ImportDataEntryVisibilityRequest
import com.evgenltd.financemanager.importexport.record.ImportDataLinkRequest
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.service.ImportDataProcessService
import com.evgenltd.financemanager.importexport.service.ImportDataService
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.importexport.record.ImportDataEntryApproveSuggestionRequest
import com.evgenltd.financemanager.importexport.record.ImportDataFinishRequest
import com.evgenltd.financemanager.importexport.record.ImportDataUnlinkRequest
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.util.*

@RestController
@DataResponse
@SkipLogging
class ImportDataController(
    private val importDataService: ImportDataService,
    private val importDataProcessService: ImportDataProcessService,
) {

    @PostMapping("/import-data/{id}/manage")
    fun importDataManage(@PathVariable id: UUID, @RequestParam progress: Boolean) {
        importDataProcessService.importDataManage(id, progress)
    }

    @GetMapping("/import-data")
    fun list(): List<Reference> = importDataService.list()

    @GetMapping("/import-data/{id}")
    fun get(@PathVariable id: UUID): ImportDataRecord = importDataService.get(id)

    @GetMapping("/import-data/{id}/entry")
    fun entryList(@PathVariable id: UUID, request: EntryFilter): List<ImportDataEntryGroupRecord> =
        importDataService.entryList(id, request)

    @PostMapping("/import-data/begin")
    fun beginNewImport(@RequestPart("data") request: ImportDataCreateRequest, @RequestPart("file") file: MultipartFile): UUID {
        val importData = importDataService.save(request)
        importDataProcessService.beginNewImport(importData.id!!, file.inputStream)
        return importData.id!!
    }

    @PostMapping("/import-data/{id}/actual-balance")
    fun saveActualBalance(@PathVariable id: UUID, @RequestBody balance: Amount) {
        importDataProcessService.saveActualBalance(id, balance)
    }

    @PostMapping("/import-data/{id}/finish")
    fun finish(@PathVariable id: UUID, @RequestBody request: ImportDataFinishRequest) {
        importDataProcessService.finish(id, request.revise)
    }

    @PostMapping("/import-data/{id}/entry/link")
    fun linkOperation(@PathVariable id: UUID, @RequestBody request: ImportDataLinkRequest) {
        importDataProcessService.linkOperation(id, request.entryId, request.operationId)
    }

    @PostMapping("/import-data/{id}/entry/{entryId}/link")
    fun linkOperation(@PathVariable id: UUID, @PathVariable entryId: UUID, @RequestBody request: OperationRecord) {
        importDataProcessService.linkOperation(id, entryId, request)
    }

    @PostMapping("/import-data/{id}/entry/unlink")
    fun unlinkOperation(@PathVariable id: UUID, @RequestBody request: ImportDataUnlinkRequest) = importDataProcessService.unlinkOperation(id, request.entryIds)

    @PostMapping("/import-data/{id}/entry/visibility")
    fun entryVisibility(@PathVariable id: UUID, @RequestBody request: ImportDataEntryVisibilityRequest) {
        importDataProcessService.entryVisibility(id, request.operations, request.entries, request.visible)
    }

    @PostMapping("/import-data/{id}/entry/approve")
    fun approveSuggestion(@PathVariable id: UUID, @RequestBody request: ImportDataEntryApproveSuggestionRequest) {
        importDataProcessService.approveSuggestion(id, request.entryIds)
    }

    @DeleteMapping("/import-data/{id}")
    fun delete(@PathVariable id: UUID) = importDataProcessService.delete(id)

}
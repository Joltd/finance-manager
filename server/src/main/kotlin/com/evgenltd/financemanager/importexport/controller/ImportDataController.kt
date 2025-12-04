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
import com.evgenltd.financemanager.common.service.FileService
import com.evgenltd.financemanager.importexport.record.ImportDataEntryApproveSuggestionRequest
import com.evgenltd.financemanager.importexport.record.ImportDataFinishRequest
import com.evgenltd.financemanager.importexport.record.ImportDataUnlinkRequest
import org.springframework.security.access.prepost.PreAuthorize
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
    private val fileService: FileService,
) {

    @PostMapping("/api/v1/import-data/{id}/manage")
    @PreAuthorize("hasRole('USER')")
    fun importDataManage(@PathVariable id: UUID, @RequestParam progress: Boolean) {
        importDataProcessService.importDataManage(id, progress)
    }

    @GetMapping("/api/v1/import-data")
    @PreAuthorize("hasRole('USER')")
    fun list(): List<Reference> = importDataService.list()

    @GetMapping("/api/v1/import-data/{id}")
    @PreAuthorize("hasRole('USER')")
    fun get(@PathVariable id: UUID): ImportDataRecord = importDataService.get(id)

    @GetMapping("/api/v1/import-data/{id}/entry")
    @PreAuthorize("hasRole('USER')")
    fun entryList(@PathVariable id: UUID, request: EntryFilter): List<ImportDataEntryGroupRecord> =
        importDataService.entryList(id, request)

    @PostMapping("/api/v1/import-data/begin")
    @PreAuthorize("hasRole('USER')")
    fun beginNewImport(@RequestPart("data") request: ImportDataCreateRequest, @RequestPart("file") file: MultipartFile): UUID {
        val filename = fileService.store(file)
        val importData = importDataService.save(request)
        importDataProcessService.beginNewImport(importData.id!!, filename)
        return importData.id!!
    }

    @PostMapping("/api/v1/import-data/{id}/actual-balance")
    @PreAuthorize("hasRole('USER')")
    fun saveActualBalance(@PathVariable id: UUID, @RequestBody balance: Amount) {
        importDataProcessService.saveActualBalance(id, balance)
    }

    @PostMapping("/api/v1/import-data/{id}/finish")
    @PreAuthorize("hasRole('USER')")
    fun finish(@PathVariable id: UUID, @RequestBody request: ImportDataFinishRequest) {
        importDataProcessService.finish(id, request.revise)
    }

    @PostMapping("/api/v1/import-data/{id}/entry/link")
    @PreAuthorize("hasRole('USER')")
    fun linkOperation(@PathVariable id: UUID, @RequestBody request: ImportDataLinkRequest) {
        importDataProcessService.linkOperation(id, request.entryId, request.operationId)
    }

    @PostMapping("/api/v1/import-data/{id}/entry/{entryId}/link")
    @PreAuthorize("hasRole('USER')")
    fun linkOperation(@PathVariable id: UUID, @PathVariable entryId: UUID, @RequestBody request: OperationRecord) {
        importDataProcessService.linkOperation(id, entryId, request)
    }

    @PostMapping("/api/v1/import-data/{id}/entry/unlink")
    @PreAuthorize("hasRole('USER')")
    fun unlinkOperation(@PathVariable id: UUID, @RequestBody request: ImportDataUnlinkRequest) = importDataProcessService.unlinkOperation(id, request.entryIds)

    @PostMapping("/api/v1/import-data/{id}/entry/visibility")
    @PreAuthorize("hasRole('USER')")
    fun entryVisibility(@PathVariable id: UUID, @RequestBody request: ImportDataEntryVisibilityRequest) {
        importDataProcessService.entryVisibility(id, request.operations, request.entries, request.visible)
    }

    @PostMapping("/api/v1/import-data/{id}/entry/approve")
    @PreAuthorize("hasRole('USER')")
    fun approveSuggestion(@PathVariable id: UUID, @RequestBody request: ImportDataEntryApproveSuggestionRequest) {
        importDataProcessService.approveSuggestion(id, request.entryIds)
    }

    @DeleteMapping("/api/v1/import-data/{id}")
    @PreAuthorize("hasRole('USER')")
    fun delete(@PathVariable id: UUID) = importDataProcessService.delete(id)

}
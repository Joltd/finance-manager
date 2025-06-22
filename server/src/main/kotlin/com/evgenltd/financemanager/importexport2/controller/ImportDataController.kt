package com.evgenltd.financemanager.importexport2.controller

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.EntityPageRequest
import com.evgenltd.financemanager.common.record.EntityPageResponse
import com.evgenltd.financemanager.importexport2.record.ImportDataCreateRequest
import com.evgenltd.financemanager.importexport2.record.ImportDataOperationRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataRecord
import com.evgenltd.financemanager.importexport2.record.LinkOperationRequest
import com.evgenltd.financemanager.importexport2.record.OperationFilter
import com.evgenltd.financemanager.importexport2.service.ImportDataProcessService
import com.evgenltd.financemanager.importexport2.service.ImportDataService
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.reference.record.Reference
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@RestController
class ImportDataController(
    private val importDataService: ImportDataService,
    private val importDataProcessService: ImportDataProcessService,
) {

    @GetMapping("/import-data")
    fun list(): List<Reference> = importDataService.list()

    @GetMapping("/import-data/account")
    fun accountList(): List<Reference> = importDataService.accountList()

    @GetMapping("/import-data/operation")
    fun operationList(@RequestParam entryId: UUID, request: EntityPageRequest<OperationFilter>): EntityPageResponse<ImportDataOperationRecord> =
        importDataService.operationList(entryId, request)

    @PostMapping("/import-data/link-operation")
    fun linkOperation(@RequestBody request: LinkOperationRequest) {
        importDataProcessService.linkOperation(request.entryId, request.operationId)
    }

    @GetMapping("/import-data/{id}")
    @SkipLogging
    fun get(@PathVariable id: UUID): ImportDataRecord = importDataService.get(id)
    
    @DeleteMapping("/import-data/{id}")
    fun delete(@PathVariable id: UUID) = importDataService.delete(id)

    @PostMapping("/import-data/begin")
    fun beginNewImport(@RequestPart("data") request: ImportDataCreateRequest, @RequestPart("file") file: MultipartFile): UUID {
        val importData = importDataService.save(request)
        importDataProcessService.beginNewImport(importData.id!!, file.inputStream)
        return importData.id!!
    }

}
package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.repository.*
import com.evgenltd.financemanager.importexport.converter.ImportDataConverter
import com.evgenltd.financemanager.importexport.converter.ImportDataEntryConverter
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataStatus
import com.evgenltd.financemanager.importexport.entity.ImportOption
import com.evgenltd.financemanager.importexport.record.*
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.util.UUID

@Service
class ImportDataService(
    private val importDataRepository: ImportDataRepository,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val importDataConverter: ImportDataConverter,
    private val importDataEntryConverter: ImportDataEntryConverter,
    private val importDataProcessService: ImportDataProcessService,
    private val accountRepository: AccountRepository
) {

    fun subscribe(): SseEmitter = importDataProcessService.subscribe()

    fun list(): List<ImportDataRecord> = importDataRepository.findAll()
        .map { importDataConverter.toRecord(it) }

    fun entryList(id: UUID, filter: ImportDataEntryFilter): ImportDataEntryPage =
        importDataEntryRepository.findAllByCondition(filter.page, filter.size, Sort.by(Sort.Direction.DESC, ImportDataEntry::date.name)) {
            (ImportDataEntry.Companion::importDataId eq id) and
//            (ImportDataEntry.Companion::suggestedOperationType eq filter.operationType) and
            (ImportDataEntry.Companion::preparationResult eq filter.preparationResult) and
            (ImportDataEntry.Companion::option eq filter.option) and
            (if (filter.hideSkip) (ImportDataEntry.Companion::option notEq ImportOption.SKIP) else emptyCondition()) and
            (ImportDataEntry.Companion::importResult eq filter.importResult)
        }.let {
            ImportDataEntryPage(
                total = it.totalElements,
                page = filter.page,
                size = filter.size,
                entries = it.content
                    .sortedByDescending { entry -> entry.parsedEntry.date }
                    .map { entry -> importDataEntryConverter.toRecord(entry) }
            )
        }

    fun byId(id: UUID): ImportDataRecord = importDataRepository.find(id)
        .let { importDataConverter.toRecord(it) }

    fun byIdEntry(id: UUID, entryId: UUID): ImportDataEntryRecord = importDataEntryRepository.find(entryId)
        .let { importDataEntryConverter.toRecord(it) }

    fun entryUpdate(id: UUID, entryId: UUID, request: ImportDataEntryUpdateRequest) {
        importDataProcessService.entryUpdate(id, entryId, request)
    }

    fun entryUpdateSimilar(id: UUID, entryId: UUID) {
        importDataProcessService.entryUpdateSimilar(id, entryId)
    }

    @Transactional
    fun delete(id: UUID) {
        importDataEntryRepository.deleteByImportDataId(id)
        importDataRepository.deleteById(id)
    }

    fun preparationStart(
        parser: UUID,
        account: UUID,
        currency: String?,
        file: MultipartFile
    ) {
        val importData = ImportData(
            id = null,
            parser = parser,
            account = accountRepository.find(account),
            currency = currency,
            status = ImportDataStatus.NEW,
            message = null,
            progress = 0.0
        )
        val result = importDataRepository.save(importData)
        importDataProcessService.preparationStart(result.id!!, file.inputStream)
    }

    fun preparationRepeat(id: UUID) {
        importDataProcessService.preparationRepeat(id)
    }

    fun preparationCancel(id: UUID) {
        importDataProcessService.preparationCancel(id)
    }

    fun importStart(id: UUID) {
        importDataProcessService.importStart(id)
    }

    fun importCancel(id: UUID) {
        importDataProcessService.importCancel(id)
    }

}
package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.findAllByCondition
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataStatus
import com.evgenltd.financemanager.importexport.record.ImportDataEntryFilter
import com.evgenltd.financemanager.importexport.record.ImportDataEntryPage
import com.evgenltd.financemanager.importexport.record.ImportDataEntryRecord
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.reference.record.toRecord
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@Service
class ImportDataService(
    private val importDataRepository: ImportDataRepository,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val importParserService: ImportParserService,
    private val importDataProcessService: ImportDataProcessService,
    private val accountRepository: AccountRepository
) {

    fun list(): List<ImportDataRecord> = importDataRepository.findAll()
        .map { it.toRecord() }

    fun entryList(id: UUID, filter: ImportDataEntryFilter): ImportDataEntryPage =
        importDataEntryRepository.findAllByCondition(filter.page, filter.size) {
            (ImportDataEntry.Companion::preparationResult eq filter.preparationResult) and
            (ImportDataEntry.Companion::option eq filter.option) and
            (ImportDataEntry.Companion::importResult eq filter.importResult)
        }.let {
            ImportDataEntryPage(
                total = it.totalElements,
                page = filter.page,
                size = filter.size,
                entries = it.content.map { entry -> entry.toRecord() }
            )
        }

    fun byId(id: UUID): ImportDataRecord = importDataRepository.find(id)
        .toRecord()

    fun preparationStart(
        parser: UUID,
        account: UUID,
        file: MultipartFile
    ) {
        val importData = ImportData(
            id = null,
            parser = parser,
            account = accountRepository.find(account),
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

    private fun ImportData.toRecord(): ImportDataRecord = ImportDataRecord(
        id = id!!,
        parser = importParserService.byId(parser),
        account = account.toRecord(),
        status = status,
        message = message,
        progress = progress
    )

    private fun ImportDataEntry.toRecord(): ImportDataEntryRecord = ImportDataEntryRecord(
        id = id!!
    )

}
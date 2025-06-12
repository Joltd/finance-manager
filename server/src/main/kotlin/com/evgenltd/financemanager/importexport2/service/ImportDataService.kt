package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.importexport.converter.ImportDataConverter
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataOperationType
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport2.record.ImportDataCreateRequest
import com.evgenltd.financemanager.importexport2.record.ImportDataEntryRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataRecord
import com.evgenltd.financemanager.reference.converter.AccountConverter
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ImportDataService(
    private val accountRepository: AccountRepository,
    private val accountConverter: AccountConverter,
    private val importDataRepository: ImportDataRepository,
    private val importDataConverter: ImportDataConverter,
) {

    fun list(): List<Reference> = importDataRepository.findAll()
        .map { importDataConverter.toReference(it) }

    fun accountList(): List<Reference> = accountRepository.findByTypeAndParserIsNotNull(AccountType.ACCOUNT)
        .map { accountConverter.toReference(it) }

    fun get(id: UUID): ImportDataRecord {
        val importData = importDataRepository.findByIdOrNull(id)
            ?: throw IllegalArgumentException("Import data not found")

        return ImportDataRecord(
            id = importData.id!!,
            account = accountConverter.toRecord(importData.account),
            entries = importData.entries
                .map { it.toRecord() }
        )
    }

    private fun ImportDataEntry.toRecord(): ImportDataEntryRecord {
        val operation = operations.firstOrNull { it.importType == ImportDataOperationType.PARSED }
        return ImportDataEntryRecord(
            id = id!!,
            progress = progress,
            approved = approved,
            data = operation?.date,
            type = operation?.type,
            amountFrom = operation?.amountFrom,
            accountFrom = operation?.accountFrom?.let { accountConverter.toRecord(it) },
            amountTo = operation?.amountTo,
            accountTo = operation?.accountTo?.let { accountConverter.toRecord(it) },
            description = operation?.description,
            raw = operation?.raw ?: emptyList()
        )
    }

    fun save(request: ImportDataCreateRequest): ImportData {
        val account = accountRepository.find(request.account)

        val importData = ImportData(account = account)
        return importDataRepository.save(importData)
    }

}
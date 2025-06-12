package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.common.repository.find
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
        val importData = importDataRepository.find(id)
        return importDataConverter.toRecord(importData)
    }

    fun save(request: ImportDataCreateRequest): ImportData {
        val account = accountRepository.find(request.account)

        val importData = ImportData(account = account)
        return importDataRepository.save(importData)
    }

    fun delete(id: UUID) {
        importDataRepository.deleteById(id)
    }

}
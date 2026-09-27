package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.record.ImportDataCreateRequest
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.repository.ImportDataDayRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@SkipLogging
class ImportDataService(
    private val accountRepository: AccountRepository,
    private val balanceRepository: BalanceRepository,
    private val importDataRepository: ImportDataRepository,
    private val importDataConverter: ImportDataConverter,
    private val importDataDayRepository: ImportDataDayRepository,
) {

    fun list(): List<Reference> = importDataRepository.findAll().map { importDataConverter.toReference(it) }

    @Transactional
    fun get(id: UUID): ImportDataRecord {
        val importData = importDataRepository.find(id)
        val dateRange = importDataDayRepository.findImportDataDateRange(importData)
        val balances = balanceRepository.findByAccount(importData.account).associate { it.amount.currency to it.amount }
        return importDataConverter.toRecord(importData, dateRange, balances)
    }

    fun save(request: ImportDataCreateRequest): ImportData = ImportData(
        account = accountRepository.find(request.account),
        currency = request.currency,
    ).let { importDataRepository.save(it) }

    fun delete(id: UUID) {
        importDataRepository.deleteById(id)
    }
}

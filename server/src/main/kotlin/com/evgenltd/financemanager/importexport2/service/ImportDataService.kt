package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.EntityPageRequest
import com.evgenltd.financemanager.common.record.EntityPageResponse
import com.evgenltd.financemanager.common.record.between
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport2.record.ImportDataCreateRequest
import com.evgenltd.financemanager.importexport2.record.ImportDataOperationRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataRecord
import com.evgenltd.financemanager.importexport2.record.OperationFilter
import com.evgenltd.financemanager.operation.converter.OperationConverter
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.reference.converter.AccountConverter
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ImportDataService(
    private val accountRepository: AccountRepository,
    private val accountConverter: AccountConverter,
    private val operationRepository: OperationRepository,
    private val operationConverter: OperationConverter,
    private val importDataRepository: ImportDataRepository,
    private val importDataConverter: ImportDataConverter,
) {

    fun list(): List<Reference> = importDataRepository.findAll()
        .map { importDataConverter.toReference(it) }

    fun accountList(): List<Reference> = accountRepository.findByTypeAndParserIsNotNull(AccountType.ACCOUNT)
        .map { accountConverter.toReference(it) }

    fun operationList(entryId: UUID, request: EntityPageRequest<OperationFilter>): EntityPageResponse<ImportDataOperationRecord> {
        val filter = (Operation::date between request.filter?.date)

        val pageable = PageRequest.of(
            request.page,
            request.size,
            request.sort
                .map { Sort.Order(Sort.Direction.valueOf(it.direction.name), it.field) }
                .let { Sort.by(it) }
        )

        val page = operationRepository.findAll(filter, pageable)
            .map { importDataConverter.toRecord(it) }

        return EntityPageResponse(
            page = page.number,
            size = page.size,
            records = page.content,
            total = page.totalElements
        )
    }

    @SkipLogging
    fun get(id: UUID): ImportDataRecord {
        val importData = importDataRepository.find(id)
//        val r = importData.entries
//            .flatMap { it.operations }
//            .filter { it.importType == ImportDataOperationType.PARSED }
//            .flatMap { listOf(it.amountFrom, it.amountTo) }
//            .groupBy { it.currency }
//            .mapValues { it.value.reduceRight { amount, acc -> amount + acc } }
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
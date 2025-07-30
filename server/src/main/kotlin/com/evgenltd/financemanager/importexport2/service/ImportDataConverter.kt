package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.importexport.converter.ImportParserConverter
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataOperation
import com.evgenltd.financemanager.importexport.entity.ImportDataTotal
import com.evgenltd.financemanager.importexport.entity.ImportDataTotalType
import com.evgenltd.financemanager.importexport2.record.ImportDataDateRange
import com.evgenltd.financemanager.importexport2.record.ImportDataOperationRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataTotalRecord
import com.evgenltd.financemanager.reference.converter.AccountConverter
import com.evgenltd.financemanager.reference.record.Reference
import org.springframework.stereotype.Service

@Service
@SkipLogging
class ImportDataConverter(
    private val accountConverter: AccountConverter,
    private val importParserConverter: ImportParserConverter
) {

    fun toReference(entity: ImportData): Reference = Reference(
        id = entity.id!!,
        name = "${entity.account.name} - ${entity.id!!.toString().substring(0, 4)}",
    )

    fun toRecord(importData: ImportData, dateRange: ImportDataDateRange?, totals: List<ImportDataTotal>): ImportDataRecord = ImportDataRecord(
        id = importData.id!!,
        account = accountConverter.toRecord(importData.account),
        dateRange = dateRange?.let {
            Range(
                from = dateRange.min,
                to = dateRange.max
            )
        },
        progress = importData.progress,
        totals = toRecords(totals)
    )

//    fun toRecord(importDataEntry: ImportDataEntry): ImportDataEntryRecord {
//        val operation = importDataEntry.operations.firstOrNull { it.importType == ImportDataOperationType.PARSED }
//        return ImportDataEntryRecord(
//            id = importDataEntry.id!!,
//            progress = importDataEntry.progress,
//            approved = importDataEntry.approved,
//            operationId = null,
//            date = operation?.date,
//            type = operation?.type,
//            amountFrom = operation?.amountFrom,
//            accountFrom = operation?.accountFrom?.let { accountConverter.toRecord(it) },
//            amountTo = operation?.amountTo,
//            accountTo = operation?.accountTo?.let { accountConverter.toRecord(it) },
//            description = operation?.description,
//            raw = operation?.raw ?: emptyList()
//        )
//    }

//    fun toRecord(operation: Operation): ImportDataOperationRecord = ImportDataOperationRecord(
//        id = operation.id!!,
//        date = operation.date,
//        type = operation.type,
//        amountFrom = operation.amountFrom,
//        accountFrom = operation.accountFrom.let { accountConverter.toRecord(it) },
//        amountTo = operation.amountTo,
//        accountTo = operation.accountTo.let { accountConverter.toRecord(it) },
//        description = operation.description,
//        distance = 0.0,
//    )

    fun toRecord(operation: ImportDataOperation): ImportDataOperationRecord = ImportDataOperationRecord(
        id = operation.id,
        entryId = operation.importDataEntry.id,
        date = operation.date,
        type = operation.type,
        amountFrom = operation.amountFrom,
        accountFrom = operation.accountFrom?.let { accountConverter.toRecord(it) },
        amountTo = operation.amountTo,
        accountTo = operation.accountTo?.let { accountConverter.toRecord(it) },
        selected = operation.selected,
        distance = operation.distance,
    )

    fun toRecords(totals: List<ImportDataTotal>): List<ImportDataTotalRecord> = totals.groupBy { it.amount.currency }
        .map { toRecord(it.key, it.value) }

    fun toRecord(currency: String, totals: List<ImportDataTotal>): ImportDataTotalRecord = ImportDataTotalRecord(
        currency = currency,
        operation = totals.firstOrNull { it.type == ImportDataTotalType.OPERATION }?.amount,
        byImport = totals.firstOrNull { it.type == ImportDataTotalType.OPERATION }?.amount,
        parsed = totals.firstOrNull { it.type == ImportDataTotalType.PARSED }?.amount,
        actual = totals.firstOrNull { it.type == ImportDataTotalType.ACTUAL }?.amount,
    )

}
package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataOperation
import com.evgenltd.financemanager.importexport.entity.ImportDataOperationType
import com.evgenltd.financemanager.importexport.entity.ImportDataTotal
import com.evgenltd.financemanager.importexport.entity.ImportDataTotalType
import com.evgenltd.financemanager.importexport2.record.ImportDataDateRange
import com.evgenltd.financemanager.importexport2.record.ImportDataEntryGroupRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataEntryRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataOperationRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataTotalRecord
import com.evgenltd.financemanager.operation.converter.OperationConverter
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.importexport.service.parsed
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
@SkipLogging
class ImportDataConverter(
    private val accountConverter: AccountConverter,
    private val operationConverter: OperationConverter,
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

    fun toRecord(operation: ImportDataOperation): ImportDataOperationRecord = ImportDataOperationRecord(
        id = operation.id,
        date = operation.date,
        type = operation.type,
        amountFrom = operation.amountFrom,
        accountFrom = operation.accountFrom?.let { accountConverter.toRecord(it) },
        amountTo = operation.amountTo,
        accountTo = operation.accountTo?.let { accountConverter.toRecord(it) },
        description = operation.description,
        raw = operation.raw,
        selected = operation.selected,
        distance = operation.distance,
        rating = suggestionRating(operation.distance)
    )

    fun toRecords(totals: List<ImportDataTotal>): List<ImportDataTotalRecord> = totals.groupBy { it.amount.currency }
        .map { toRecord(it.key, it.value) }

    fun toRecord(currency: String, totals: List<ImportDataTotal>): ImportDataTotalRecord {
        val operation = totals.firstOrNull { it.type == ImportDataTotalType.OPERATION }?.amount
        val suggested = totals.firstOrNull { it.type == ImportDataTotalType.SUGGESTED }?.amount
        val parsed = totals.firstOrNull { it.type == ImportDataTotalType.PARSED }?.amount
        val actual = totals.firstOrNull { it.type == ImportDataTotalType.ACTUAL }?.amount
        val expectedBalance = emptyAmount(currency) + operation + suggested
        return ImportDataTotalRecord(
            currency = currency,
            operation = operation,
            suggested = suggested,
            parsed = parsed,
            actual = actual,
            valid = expectedBalance == parsed && (actual == null || actual == expectedBalance),
        )
    }

    fun toEntryGroupRecord(date: LocalDate, totals: List<ImportDataTotal>): ImportDataEntryGroupRecord {
        val totalsByDate = toRecords(totals)
        return ImportDataEntryGroupRecord(
            date = date,
            valid = totalsByDate.all { (emptyAmount(it.currency) + it.operation + it.suggested) == it.parsed },
            totals = totalsByDate,
            entries = emptyList()
        )
    }

    fun toEntryRecord(importData: ImportData, entry: ImportDataEntry): ImportDataEntryRecord =
        ImportDataEntryRecord(
            id = entry.id,
            linked = entry.operation != null,
            operation = entry.operation?.let { operation -> operationConverter.toRecord(operation) },
            operationVisible = entry.operation?.id !in importData.hiddenOperations,
            parsed = entry.parsed()
                ?.let { operation -> toRecord(operation) },
            parsedVisible = entry.visible,
            suggestions = entry.operations
                .filter { operation -> operation.importType == ImportDataOperationType.SUGGESTION }
                .map { operation -> toRecord(operation) }
                .sortedByDescending { it.distance },
        )

    fun toEntryRecord(importData: ImportData, operation: Operation): ImportDataEntryRecord =
        ImportDataEntryRecord(
            operation = operationConverter.toRecord(operation),
            operationVisible = operation.id !in importData.hiddenOperations
        )

}
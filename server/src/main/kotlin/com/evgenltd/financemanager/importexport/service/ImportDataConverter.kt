package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.ai.converter.EmbeddingConverter
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataOperation
import com.evgenltd.financemanager.importexport.entity.ImportDataTotal
import com.evgenltd.financemanager.importexport.record.*
import com.evgenltd.financemanager.operation.converter.OperationConverter
import com.evgenltd.financemanager.operation.entity.Operation
import org.springframework.stereotype.Service

@Service
@SkipLogging
class ImportDataConverter(
    private val accountConverter: AccountConverter,
    private val operationConverter: OperationConverter,
    private val embeddingConverter: EmbeddingConverter,
) {

    fun toReference(entity: ImportData): Reference = Reference(
        id = entity.id!!,
        name = "${entity.account.name} - ${entity.id!!.toString().substring(0, 4)}",
    )

    fun toRecord(importData: ImportData, dateRange: ImportDataDateRange?, balances: Map<String, Amount>): ImportDataRecord = ImportDataRecord(
        id = importData.id!!,
        account = accountConverter.toRecord(importData.account),
        dateRange = dateRange?.let {
            Range(from = dateRange.min, to = dateRange.max)
        },
        parsingStatus = importData.parsingStatus,
        failedEntries = importData.failedEntries,
        valid = importData.valid,
        totals = importData.totals.map { toRecord(it, balances[it.currency]) }
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
        hint = operation.hint?.let { embeddingConverter.toRecord(it) },
        selected = operation.selected,
        distance = operation.score,
        rating = suggestionRating(operation.score)
    )

    fun toRecord(total: ImportDataTotal, balance: Amount? = null): ImportDataTotalRecord = ImportDataTotalRecord(
        currency = total.currency,
        parsed = total.parsed,
        suggested = total.suggested,
        operation = total.operation,
        actual = total.actual,
        balance = balance ?: emptyAmount(total.currency),
        valid = total.valid,
    )

    fun toRecord(importData: ImportData, entry: ImportDataEntry): ImportDataEntryRecord =
        ImportDataEntryRecord(
            id = entry.id,
            linked = entry.operation != null,
            operation = entry.operation?.let { operation -> operationConverter.toRecord(operation) },
            operationVisible = entry.operation?.id !in importData.hiddenOperations,
            parsed = entry.parsed().firstOrNull()?.let { operation -> toRecord(operation) },
            parsedVisible = entry.visible,
            suggestions = entry.suggested()
                .map { operation -> toRecord(operation) }
                .sortedByDescending { it.distance },
        )

    fun toRecord(importData: ImportData, operation: Operation): ImportDataEntryRecord =
        ImportDataEntryRecord(
            operation = operationConverter.toRecord(operation),
            operationVisible = operation.id !in importData.hiddenOperations
        )

    fun toOperationRecord(operation: ImportDataOperation): Operation = Operation(
        id = null,
        date = operation.date,
        type = operation.type,
        amountFrom = operation.amountFrom,
        accountFrom = operation.accountFrom!!,
        amountTo = operation.amountTo,
        accountTo = operation.accountTo!!,
        description = operation.description,
        raw = operation.raw,
        hint = operation.hint,
    )

}
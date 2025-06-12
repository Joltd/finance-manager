package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.importexport.converter.ImportParserConverter
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataOperationType
import com.evgenltd.financemanager.importexport2.record.ImportDataRecord
import com.evgenltd.financemanager.importexport2.record.ImportDataEntryRecord
import com.evgenltd.financemanager.reference.converter.AccountConverter
import com.evgenltd.financemanager.reference.record.Reference
import org.springframework.stereotype.Service

@Service
class ImportDataConverter(
    private val accountConverter: AccountConverter,
    private val importParserConverter: ImportParserConverter
) {

    fun toReference(entity: ImportData): Reference = Reference(
        id = entity.id!!,
        name = "${entity.account.name} - ${entity.id!!.toString().substring(0, 4)}",
    )

    fun toRecord(importData: ImportData): ImportDataRecord = ImportDataRecord(
        id = importData.id!!,
        account = accountConverter.toRecord(importData.account),
        entries = importData.entries
            .map { toRecord(it) }
    )

    fun toRecord(importDataEntry: ImportDataEntry): ImportDataEntryRecord {
        val operation = importDataEntry.operations.firstOrNull { it.importType == ImportDataOperationType.PARSED }
        return ImportDataEntryRecord(
            id = importDataEntry.id!!,
            progress = importDataEntry.progress,
            approved = importDataEntry.approved,
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

}
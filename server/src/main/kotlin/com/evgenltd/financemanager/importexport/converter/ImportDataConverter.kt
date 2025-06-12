package com.evgenltd.financemanager.importexport.converter

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.operation.record.OperationRecord
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
        deleted = false
    )

    fun toRecord(entity: ImportData): ImportDataRecord = ImportDataRecord(
        id = entity.id!!,
        parser = importParserConverter.toReference(entity.parser),
        account = accountConverter.toRecord(entity.account),
        currency = entity.currency,
        status = entity.status,
        message = entity.message,
        progress = entity.progress
    )

}
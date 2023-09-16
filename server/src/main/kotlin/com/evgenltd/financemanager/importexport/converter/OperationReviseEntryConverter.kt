package com.evgenltd.financemanager.importexport.converter

import com.evgenltd.financemanager.importexport.entity.OperationReviseEntry
import com.evgenltd.financemanager.importexport.record.OperationReviseEntryRecord
import com.evgenltd.financemanager.operation.converter.OperationConverter
import com.evgenltd.financemanager.operation.service.OperationService
import com.evgenltd.financemanager.reference.converter.AccountConverter
import org.springframework.stereotype.Service

@Service
class OperationReviseEntryConverter(
    private val operationConverter: OperationConverter
) {

    fun toRecord(entity: OperationReviseEntry): OperationReviseEntryRecord = OperationReviseEntryRecord(
        id = entity.id!!,
        date = entity.date,
        operation = entity.operation?.let { operationConverter.toRecord(it) },
        parsedEntry = entity.parsedEntry
    )

}
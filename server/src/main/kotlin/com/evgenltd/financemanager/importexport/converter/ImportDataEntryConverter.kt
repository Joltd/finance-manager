package com.evgenltd.financemanager.importexport.converter

import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.record.ImportDataEntryRecord
import com.evgenltd.financemanager.operation.converter.OperationConverter
import org.springframework.stereotype.Service

@Service
class ImportDataEntryConverter(
    private val categoryMappingConverter: CategoryMappingConverter,
    private val operationConverter: OperationConverter
) {

    fun toRecord(entity: ImportDataEntry): ImportDataEntryRecord = ImportDataEntryRecord(
        id = entity.id!!,
        parsedEntry = entity.parsedEntry,
        suggestedOperation = entity.suggestedOperation,
        similarOperations = entity.similarOperations.map { operationConverter.toRecord(it) },
        matchedCategoryMappings = entity.matchedCategoryMappings.map { categoryMappingConverter.toRecord(it) },
        preparationResult = entity.preparationResult,
        preparationError = entity.preparationError,
        option = entity.option,
        importResult = entity.importResult,
        importError = entity.importError
    )

}
package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.importexport.entity.ImportOption
import com.evgenltd.financemanager.importexport.entity.ImportResult

data class ImportDataEntryRecord(
    val id: String,
    val parsedEntry: ImportDataParsedEntry,
    val suggestedDocument: DocumentTypedRecord? = null,
    val existedDocuments: List<DocumentTypedRecord> = emptyList(),
    val matchedCategoryMappings: List<CategoryMappingRecord> = emptyList(),
    val preparationResult: Boolean = false,
    val preparationError: String? = null,
    val option: ImportOption = ImportOption.NONE,
    val importResult: ImportResult = ImportResult.NOT_IMPORTED,
    val importError: String? = null
)

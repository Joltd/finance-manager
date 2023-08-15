package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.document.entity.Document
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry

class ImportDataEntry(
    var id: String? = null,
    var importData: String,
    var parsedEntry: ImportDataParsedEntry,
    var suggestedDocument: Document? = null,
    var existedDocuments: List<String> = emptyList(),
    var matchedCategoryMappings: List<CategoryMapping> = emptyList(),
    var preparationResult: Boolean = false,
    var preparationError: String? = null,
    var option: ImportOption = ImportOption.NONE,
    var importResult: ImportResult = ImportResult.NOT_IMPORTED,
    var importError: String? = null
)

enum class ImportOption {
    NONE,
    CREATE_NEW,
    SKIP,
    REPLACE
}

enum class ImportResult {
    NOT_IMPORTED,
    DONE,
    FAILED
}
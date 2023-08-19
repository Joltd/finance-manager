package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.document.record.DocumentTypedRecord
import com.evgenltd.financemanager.importexport.entity.ImportOption

data class ImportDataEntryUpdateRequest(
    val entryId: String,
    val option: ImportOption? = null,
    val suggestedDocument: DocumentTypedRecord? = null
)
package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.document.record.DocumentTypedRecord

class ImportDataRecord(
        val id: String?,
        val description: String,
        val entries: List<ImportDataEntryRecord> = emptyList()
)

class ImportDataEntryRecord(
        val id: String?,
        val raw: String,
        val suggested: DocumentTypedRecord?,
        val skip: Boolean,
        val result: Boolean?,
        val message: String?,
        val forRemove: List<DocumentTypedRecord> = emptyList()
)

class ImportDataEntryForRemoveRecord(val documents: Set<String>)
package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.document.record.DocumentTypedRecord

class ImportDataRecord(
        val id: String?,
        val file: String,
        val description: String,
        val documents: List<DocumentEntryRecord>,
        val currentProgress: Double? = null
)

class DocumentEntryRecord(
        val id: String,
        val source: String,
        val suggested: DocumentTypedRecord?,
        val existed: DocumentTypedRecord?,
        val result: Boolean?,
        val message: String?
)

data class ImportDataFilerResponse(val filename: String)
package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.document.record.DocumentTypedRecord

class ImportDataRecord(
        val id: String?,
        val account: String,
        val template: String,
        val file: String,
        val documents: List<DocumentEntryRecord>,
        val other: List<DocumentTypedRecord>
)

class DocumentEntryRecord(
        val id: String,
        val source: String,
        val suggested: DocumentTypedRecord?,
        val existed: DocumentTypedRecord?
)

data class ImportDataFilerResponse(val filename: String)
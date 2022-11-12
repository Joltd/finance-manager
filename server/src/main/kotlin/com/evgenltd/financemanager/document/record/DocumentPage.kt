package com.evgenltd.financemanager.document.record

class DocumentPage(
        val total: Long,
        val page: Int,
        val size: Int,
        val documents: List<DocumentTypedRecord>
)
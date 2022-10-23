package com.evgenltd.financemanager.importdata.entity

import com.evgenltd.financemanager.document.entity.Document

class ImportData(
        var id: String?,
        var account: String,
        var template: String,
        var file: String,
        var documents: List<DocumentEntry>
)

class DocumentEntry(
        val source: String,
        val suggested: Document
)
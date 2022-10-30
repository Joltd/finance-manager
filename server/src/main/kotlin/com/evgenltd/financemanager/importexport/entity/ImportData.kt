package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.document.entity.Document

class ImportData(
        var id: String?,
        var account: String,
        var template: String,
        var file: String,
        var documents: List<DocumentEntry>
)

class DocumentEntry(
        var id: String,
        var source: String,
        var suggested: Document?
)
package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.document.entity.Document

class ImportData(
        var id: String?,
        var description: String,
        var entries: List<ImportDataEntry>
)

class ImportDataEntry(
        var id: String,
        var raw: String,
        var suggested: Document?,
        var skip: Boolean = false,
        var result: Boolean? = null,
        var message: String? = null,
        var forRemove: Set<String> = emptySet()
)
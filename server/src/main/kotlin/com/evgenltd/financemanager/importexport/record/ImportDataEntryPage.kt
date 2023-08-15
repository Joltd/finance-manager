package com.evgenltd.financemanager.importexport.record

data class ImportDataEntryPage(
    val total: Long,
    val page: Int,
    val size: Int,
    val entries: List<ImportDataEntryRecord>
)
package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.importexport.entity.ImportDataStatus

data class ImportDataRecord(
    val id: String,
    val parser: String,
    val account: String,
    val accountName: String,
    val status: ImportDataStatus,
    val message: String?,
    val progress: Double
)

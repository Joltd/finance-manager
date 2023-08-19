package com.evgenltd.financemanager.importexport.record

import com.evgenltd.financemanager.importexport.entity.ImportOption
import com.evgenltd.financemanager.importexport.entity.ImportResult

data class ImportDataEntryFilter(
    val page: Int,
    val size: Int = 20,
    val preparationResult: Boolean? = null,
    val option: ImportOption? = null,
    val importResult: ImportResult? = null
)

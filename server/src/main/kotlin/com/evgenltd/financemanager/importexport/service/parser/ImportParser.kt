package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry

interface ImportParser {

    val name: String

    fun parse(importData: ImportData, filename: String): List<ImportDataParsedEntry>

}

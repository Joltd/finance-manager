package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataParsedEntry
import java.io.InputStream
import java.util.UUID

interface ImportParser {

    val id: UUID
    val name: String

    fun parse(importData: ImportData, stream: InputStream): List<ImportDataParsedEntry>

}
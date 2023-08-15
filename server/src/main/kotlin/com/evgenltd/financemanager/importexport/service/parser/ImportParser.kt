package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import java.io.InputStream

interface ImportParser {

    val id: String
    val name: String

    fun parse(stream: InputStream): List<ImportDataParsedEntry>

}
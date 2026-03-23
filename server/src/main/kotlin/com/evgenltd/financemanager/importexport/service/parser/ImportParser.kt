package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.record.ImportDataParsed
import java.io.InputStream

interface ImportParser {

    val name: String

    fun parse(importData: ImportData, stream: InputStream): ImportDataParsed

}
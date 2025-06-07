package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import org.springframework.stereotype.Service
import java.io.InputStream
import java.util.UUID

@Service
class FinanceManagerV2ImportParser : ImportParser {
    override val id: UUID = UUID.fromString("7f5f8350-7753-44b6-a3f3-47c24c699e78")
    override val name: String = "Finance Manager v2.0"

    override fun parse(importData: ImportData, stream: InputStream): List<ImportDataParsedEntry> {
        TODO("Not yet implemented")
    }
}
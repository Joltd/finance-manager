package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import org.springframework.stereotype.Service
import java.io.InputStream
import java.util.UUID

@Service
class FinanceManagerV1ImportParser : ImportParser {

    override val id: UUID = UUID.fromString("f51b0bd4-8fbd-45c8-8709-12266a846b17")
    override val name: String = "Finance Manager v1.x"

    override fun parse(stream: InputStream): List<ImportDataParsedEntry> {
        TODO("Not yet implemented")
    }
}
package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import org.springframework.stereotype.Service
import java.io.InputStream

@Service
class TbcImportParser : ImportParser {

    override val id = "TBC"
    override val name = "TBC"

    override fun parse(stream: InputStream): List<ImportDataParsedEntry> {
        return emptyList()
    }

}
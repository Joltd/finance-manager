package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.importexport.service.parser.AiImportParser
import com.evgenltd.financemanager.importexport.service.parser.ImportParser
import org.springframework.stereotype.Service

@Service
class ImportDataParserResolver(
    private val aiParser: AiImportParser,
) {

    fun resolve(@Suppress("UNUSED_PARAMETER") parser: String?): ImportParser = aiParser

}

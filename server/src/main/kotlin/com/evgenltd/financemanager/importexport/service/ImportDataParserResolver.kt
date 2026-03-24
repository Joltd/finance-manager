package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.importexport.service.parser.AiImportParser
import com.evgenltd.financemanager.importexport.service.parser.ImportParser
import org.springframework.stereotype.Service

@Service
class ImportDataParserResolver(
    private val parsers: List<ImportParser>,
    private val aiParser: AiImportParser,
) {

    fun resolve(parser: String?): ImportParser = parsers.firstOrNull { it.name == parser } ?: aiParser

}
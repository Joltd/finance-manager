package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.importexport.service.parser.ImportParser
import org.springframework.stereotype.Service

@Service
class ImportDataParserResolver(
    private val parsers: List<ImportParser>,
) {

    fun resolve(parser: String?): ImportParser = parsers.firstOrNull { it.name == parser }
        ?: throw IllegalArgumentException("Import parser [$parser] is not configured")

}

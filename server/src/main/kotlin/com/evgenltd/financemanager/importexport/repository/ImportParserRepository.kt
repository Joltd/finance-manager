package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.service.parser.ImportParser
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ImportParserRepository(
    private val importParsers: List<ImportParser>
) {

    fun findAll(): List<ImportParser> = importParsers

    fun findById(id: UUID): ImportParser? = importParsers.firstOrNull { it.id == id }

    fun find(id: UUID): ImportParser = findById(id) ?: throw IllegalArgumentException("ImportParser [$id] not found")

}
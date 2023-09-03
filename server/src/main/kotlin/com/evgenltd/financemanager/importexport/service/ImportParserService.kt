package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.importexport.service.parser.ImportParser
import com.evgenltd.financemanager.reference.record.Reference
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ImportParserService(
    private val importParsers: List<ImportParser>
) {

    fun listReference(mask: String? = null, id: UUID? = null): List<Reference> {
        val parsers = list()
        val list = if (mask?.isNotEmpty() == true) {
            parsers.filter { it.name.contains(mask) }
        } else if (id != null) {
            parsers.filter { it.id == id }
        } else {
            parsers
        }
        return list.sortedBy { it.name }
    }

    fun list(): List<Reference> = importParsers.map { it.toReference() }

    fun byId(id: UUID): Reference = list().first { it.id == id }

    private fun ImportParser.toReference() = Reference(
        id = id,
        name = name,
        deleted = false
    )

}
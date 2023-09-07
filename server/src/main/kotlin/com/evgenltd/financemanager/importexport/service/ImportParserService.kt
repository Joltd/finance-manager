package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.importexport.converter.ImportParserConverter
import com.evgenltd.financemanager.importexport.repository.ImportParserRepository
import com.evgenltd.financemanager.importexport.service.parser.ImportParser
import com.evgenltd.financemanager.reference.record.Reference
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ImportParserService(
    private val importParserConverter: ImportParserConverter,
    private val importParserRepository: ImportParserRepository
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

    fun list(): List<Reference> = importParserRepository.findAll().map { importParserConverter.toReference(it) }

    fun byId(id: UUID): Reference = importParserRepository.find(id).let { importParserConverter.toReference(it) }

    fun resolve(id: UUID): ImportParser? = importParserRepository.findById(id)

}
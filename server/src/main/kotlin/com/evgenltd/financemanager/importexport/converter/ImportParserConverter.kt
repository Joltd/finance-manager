package com.evgenltd.financemanager.importexport.converter

import com.evgenltd.financemanager.importexport.repository.ImportParserRepository
import com.evgenltd.financemanager.importexport.service.parser.ImportParser
import com.evgenltd.financemanager.common.record.Reference
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ImportParserConverter(private val importParserRepository: ImportParserRepository) {

    fun toReference(id: UUID): Reference = toReference(importParserRepository.find(id))

    fun toReference(entity: ImportParser): Reference = Reference(
        id = entity.id,
        name = entity.name,
        deleted = false
    )

}
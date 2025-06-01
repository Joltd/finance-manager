package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class ImportDataStateService(
    private val importDataEntryRepository: ImportDataEntryRepository,
) {

    private val log: Logger = LoggerFactory.getLogger(ImportDataStateService::class.java)

    @Transactional
    fun lockAllEntries(): List<UUID> {
        return emptyList()
    }

    @Transactional
    fun findAndLock(id: UUID): ImportDataEntry? {
        val importDataEntry = importDataEntryRepository.findAndLock(id, false)
        if (importDataEntry == null) {
            log.warn("ImportDataEntry [$id] not found or already in progress")
            return null
        }

        importDataEntry.progress = true

        return importDataEntry
    }

    @Transactional
    fun findAndUnlock(id: UUID): ImportDataEntry? {
        val importDataEntry = importDataEntryRepository.findAndLock(id, true)
        if (importDataEntry == null) {
            log.warn("ImportDataEntry [$id] not found or already released")
            return null
        }

        importDataEntry.progress = false

        return importDataEntry
    }

}
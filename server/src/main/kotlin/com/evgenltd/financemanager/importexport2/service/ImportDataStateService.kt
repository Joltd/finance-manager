package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class ImportDataStateService(
    private val importDataEntryRepository: ImportDataEntryRepository,
) {

    private val log: Logger = LoggerFactory.getLogger(ImportDataStateService::class.java)

    @Transactional
    fun lockAllEntries(importDataId: UUID): List<UUID> = importDataEntryRepository.lockAll(importDataId)

    @Transactional
    fun unlockEntries(entryIds: List<UUID>) = importDataEntryRepository.unlock(entryIds)

    @Transactional
    fun findAndLock(id: UUID): ImportDataEntry? {
        val importDataEntry = importDataEntryRepository.findAndLock(id)
        if (importDataEntry == null) {
            log.warn("ImportDataEntry $id not found")
            return null
        }

        if (importDataEntry.progress) {
            log.warn("ImportDataEntry $id already locked")
            return null
        }

        importDataEntry.progress = true

        return importDataEntry
    }

    @Transactional
    fun findAndUnlock(id: UUID) {
        val importDataEntry = importDataEntryRepository.findAndLock(id)
        if (importDataEntry == null) {
            log.warn("ImportDataEntry $id not found")
            return
        }

        if (importDataEntry.progress) {
            log.warn("ImportDataEntry $id already unlocked")
            return
        }

        importDataEntry.progress = false
    }

}
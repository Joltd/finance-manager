package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class ImportDataStateService(
    private val importDataRepository: ImportDataRepository,
    private val importDataEntryRepository: ImportDataEntryRepository,
) {

    private val log: Logger = LoggerFactory.getLogger(ImportDataStateService::class.java)

    @Transactional
    fun lockAllEntries(importDataId: UUID): List<UUID> = importDataEntryRepository.lockAll(importDataId)

    @Transactional
    fun unlockEntries(entryIds: List<UUID>) = importDataEntryRepository.unlock(entryIds)

    @Transactional
    fun findAndLock(id: UUID): ImportData? {
        val importData = importDataRepository.findAndLock(id)
        if (importData == null) {
            log.warn("ImportData $id not found")
            return null
        }

        if (importData.progress) {
            log.warn("ImportData $id already locked")
            return null
        }

        importData.progress = true
        return importData
    }

    @Transactional
    fun findAndUnlock(id: UUID) {
        val importData = importDataRepository.findAndLock(id)
        if (importData == null) {
            log.warn("ImportData $id not found")
            return
        }

        if (!importData.progress) {
            log.warn("ImportData $id already unlocked")
            return
        }

        importData.progress = false
    }

}
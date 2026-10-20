package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.record.BalanceCalculationCompleted
import com.evgenltd.financemanager.importexport.entity.ImportDataParsingStatus
import com.evgenltd.financemanager.importexport.record.ImportDataEntryUpdateRecord
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.operation.service.OperationProcessService
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(propagation = Propagation.NEVER)
class ImportDataProcessService(
    private val importDataActionService: ImportDataActionService,
    private val importDataEventService: ImportDataEventService,
    private val importDataRepository: ImportDataRepository,
    private val operationProcessService: OperationProcessService,
) {

    private val log: Logger = LoggerFactory.getLogger(ImportDataProcessService::class.java)

    @Async
    fun beginNewImport(id: UUID, filename: String) {
        importDataActionService.withTryLock(id) {
            try {
                updateParsingStatus(id, ImportDataParsingStatus.PARSING)
                val parsedEntries = importDataActionService.parseImportData(id, filename)
                if (parsedEntries.isEmpty()) {
                    updateParsingStatus(id, ImportDataParsingStatus.FAILED, "No transaction entries were parsed")
                    return@withTryLock
                }

                updateParsingStatus(id, ImportDataParsingStatus.PREPARATION)
                val entryIds = importDataActionService.prepareImportData(id, parsedEntries)

                updateParsingStatus(id, ImportDataParsingStatus.EMBEDDING)
                entryIds.chunked(EMBEDDING_BATCH_SIZE)
                    .forEach { importDataActionService.prepareHintEmbeddings(it) }

                updateParsingStatus(id, ImportDataParsingStatus.SUGGESTION)
                importDataActionService.prepareSuggestions(id)

                updateParsingStatus(id, ImportDataParsingStatus.LINKING)
                importDataActionService.linkEntries(id)

                updateParsingStatus(id, ImportDataParsingStatus.CALCULATION)
                importDataActionService.calculateTotals(id)

                updateParsingStatus(id, ImportDataParsingStatus.DONE)
            } catch (e: Exception) {
                updateParsingStatus(id, ImportDataParsingStatus.FAILED, e.message ?: "Unknown import error")
                log.error("Unable to import data", e)
            }
        }
    }

    fun commit(id: UUID) {
        val changes = importDataActionService.withLock(id) {
            importDataActionService.commit(id)
        }
        operationProcessService.notifyChanges(changes)

        importDataEventService.importData(id)
        changes.mapNotNull { it.new?.date }
            .distinct()
            .takeIf { it.isNotEmpty() }
            ?.let { importDataEventService.importDataEntry(id, it) }
    }

    fun updateEntry(id: UUID, entryId: UUID, record: ImportDataEntryUpdateRecord) {
        val dates = importDataActionService.withLock(id) {
            importDataActionService.updateEntry(id, entryId, record)
        }

        importDataEventService.importData(id)
        importDataEventService.importDataEntry(id, dates)
    }

    fun delete(id: UUID) {
        importDataActionService.withLock(id) {
            importDataActionService.delete(id)
        }
    }

    @EventListener
    fun balanceCalculationCompleted(event: BalanceCalculationCompleted) {
        importDataRepository.findByAccountId(event.accountId)
            .forEach { importDataEventService.importData(it.id!!) }
    }

    private fun updateParsingStatus(id: UUID, status: ImportDataParsingStatus, message: String? = null) {
        importDataActionService.updateParsingStatus(id, status, message)
        importDataEventService.importData(id)
    }

    private companion object {
        const val EMBEDDING_BATCH_SIZE = 50
    }
}

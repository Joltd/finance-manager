package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.record.BalanceCalculationCompleted
import com.evgenltd.financemanager.common.service.FileService
import com.evgenltd.financemanager.common.service.NotificationEventService
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.record.ImportDataCalculateTotalEvent
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.service.OperationProcessService
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.*

@Service
class ImportDataProcessService(
    private val importDataRepository: ImportDataRepository,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val importDataActionService: ImportDataActionService,
    private val importDataEventService: ImportDataEventService,
    private val operationProcessService: OperationProcessService,
    private val notificationEventService: NotificationEventService,
    private val fileService: FileService,
    private val publisher: ApplicationEventPublisher,
) {

    private val log: Logger = LoggerFactory.getLogger(ImportDataProcessService::class.java)

    fun importDataManage(id: UUID, progress: Boolean) {
        importDataEventService.importDataProgress(id, progress)
    }

    @Async
    fun beginNewImport(id: UUID, filename: String) {
        try {
            importDataActionService.withTryLock(id) {
                fileService.load(filename) {
                    importDataActionService.parseImportData(id, it)
                }

                importDataEntryRepository.findByImportDataId(id)
                    .chunked(50)
                    .onEach { ids ->
                        importDataActionService.prepareHintEmbeddings(ids)
                        importDataActionService.interpretImportDataEntries(ids)
                    }

                importDataActionService.linkExistedOperations(id)

                importDataActionService.calculateTotal(id)

                importDataActionService.endProgress(id)
            }
        } catch (e: Exception) {
            log.error("Unable to parse data", e)
            // write to notification
        }
    }

    fun saveActualBalance(id: UUID, balance: Amount) {
        importDataActionService.withLock(id) {
            importDataActionService.saveActualBalance(id, balance)
        }
    }

    fun finish(id: UUID) {
        importDataActionService.withLock(id) {
            importDataActionService.finish(id)
        }
    }

    fun delete(id: UUID) {
        importDataActionService.withLock(id) {
            importDataRepository.deleteById(id)
        }
    }

    fun linkOperationById(id: UUID, entryId: UUID, operationId: UUID) {
        importDataActionService.withLock(id) {
            val dates = importDataActionService.linkOperation(id, entryId, operationId)
            publisher.publishEvent(ImportDataCalculateTotalEvent(id, dates))
        }
    }

    fun linkOperation(id: UUID, entryId: UUID, operation: OperationRecord) {
        importDataActionService.withLock(id) {
            val result = operationProcessService.update(operation) // recalculation by operation events
            importDataActionService.linkOperation(id, entryId, result)
        }
    }

    fun unlinkOperation(id: UUID, entryIds: List<UUID>) {
        if (entryIds.isEmpty()) {
            return
        }
        importDataActionService.withLock(id) {
            val dates = importDataActionService.unlinkOperation(id, entryIds)
            publisher.publishEvent(ImportDataCalculateTotalEvent(id, dates))
        }
    }

    fun entryVisibility(id: UUID, operationIds: List<UUID>, entryIds: List<UUID>, visible: Boolean) {
        if (operationIds.isEmpty() || entryIds.isEmpty()) {
            return
        }
        importDataActionService.withLock(id) {
            val dates = importDataActionService.entryVisible(id, operationIds, entryIds, visible)
            publisher.publishEvent(ImportDataCalculateTotalEvent(id, dates))
        }
    }

    fun approveSuggestion(id: UUID, entryIds: List<UUID>) {
        if (entryIds.isEmpty()) {
            importDataActionService.withLock(id) {
                val result = importDataActionService.approveSuggestion(id, entryIds)  // recalculation by operation events
                for ((entryId, operationId) in result) {
                    importDataActionService.linkOperation(id, entryId, operationId)
                }
            }
        }
    }

    fun calculateTotal(id: UUID) {
        calculateTotal(id, null)
    }

    @EventListener
    @Async
    fun calculateTotal(event: ImportDataCalculateTotalEvent) {
        calculateTotal(event.id, event.dates)
    }

    @EventListener
    fun balanceCalculationCompleted(event: BalanceCalculationCompleted) {
        importDataRepository.findByAccountId(event.accountId)
            .onEach {
                publisher.publishEvent(ImportDataCalculateTotalEvent(it.id!!))
            }
    }

    private fun calculateTotal(id: UUID, dates: List<LocalDate>?) {
        importDataActionService.withLock(id) {
            importDataActionService.calculateTotal(id, dates)
        }
    }

}

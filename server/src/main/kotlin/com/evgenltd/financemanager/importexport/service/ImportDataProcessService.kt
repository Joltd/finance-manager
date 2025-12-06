package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.common.component.Task
import com.evgenltd.financemanager.common.component.TaskKey
import com.evgenltd.financemanager.common.record.NotificationType
import com.evgenltd.financemanager.common.service.FileService
import com.evgenltd.financemanager.common.service.NotificationEventService
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.operation.service.OperationProcessService
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.*

@Service
class ImportDataProcessService(
    private val importDataRepository: ImportDataRepository,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val importDataActionService: ImportDataActionService,
    private val importDataStateService: ImportDataStateService,
    private val importDataEventService: ImportDataEventService,
    private val operationProcessService: OperationProcessService,
    private val notificationEventService: NotificationEventService,
    private val fileService: FileService,
) {

    private val log: Logger = LoggerFactory.getLogger(ImportDataProcessService::class.java)

    fun importDataManage(id: UUID, progress: Boolean) {
        importDataEventService.importDataProgress(id, progress)
    }

    @Task
    fun beginNewImport(@TaskKey id: UUID, filename: String) {
        try {
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

        } catch (e: Exception) {
            log.error("Unable to parse data", e)
            notificationEventService.notification(e.message ?: "Unable to parse data", NotificationType.ERROR)
        } finally {
            importDataStateService.findAndUnlock(id)
            importDataEventService.importData(id)
            importDataEventService.importDataEntry(id, emptyList())
        }
    }

    fun saveActualBalance(id: UUID, balance: Amount) {
        importDataActionService.saveActualBalance(id, balance)
        importDataEventService.importData(id)
    }

    fun finish(id: UUID, revise: Boolean) {
        importDataActionService.finish(id, revise)
        importDataEventService.importData()
    }

    fun delete(id: UUID) {
        importDataRepository.deleteById(id)
        importDataEventService.importData()
    }

    fun linkOperationById(id: UUID, entryId: UUID, operationId: UUID) {
        try {
            withLock(id) {
                val dates = importDataActionService.linkOperation(id, entryId, operationId)
                calculateTotal(id, dates)
            }
        } catch (e: Exception) {
            log.error("Unable to link operation", e)
            notificationEventService.notification(e.message ?: "Unable to link operation", NotificationType.ERROR)
        }
    }

    @Transactional
    fun linkOperation(id: UUID, entryId: UUID, operation: OperationRecord) {
        try {
            withLock(id) {
                val result = operationProcessService.update(operation) // recalculation by operation events
                importDataActionService.linkOperation(id, entryId, result)
            }
        } catch (e: Exception) {
            log.error("Unable to link operation", e)
            notificationEventService.notification(e.message ?: "Unable to link operation", NotificationType.ERROR)
        }
    }

    fun unlinkOperation(id: UUID, entryIds: List<UUID>) {
        if (entryIds.isEmpty()) {
            return
        }
        try {
            withLock(id) {
                val dates = importDataActionService.unlinkOperation(id, entryIds)
                calculateTotal(id, dates)
            }
        } catch (e: Exception) {
            log.error("Unable to unlink operation", e)
            notificationEventService.notification(e.message ?: "Unable to unlink operation", NotificationType.ERROR)
        }
    }

    fun entryVisibility(id: UUID, operationIds: List<UUID>, entryIds: List<UUID>, visible: Boolean) {
        try {
            withLock(id) {
                val dates = importDataActionService.entryVisible(id, operationIds, entryIds, visible)
                calculateTotal(id, dates)
            }
        } catch (e: Exception) {
            log.error("Unable to change entry visibility", e)
            notificationEventService.notification(e.message ?: "Unable to change entry visibility", NotificationType.ERROR)
        }
    }

    @Transactional
    fun approveSuggestion(id: UUID, entryIds: List<UUID>) {
        try {
            withLock(id) {
                val result = importDataActionService.approveSuggestion(id, entryIds)  // recalculation by operation events
                for ((entryId, operationId) in result) {
                    importDataActionService.linkOperation(id, entryId, operationId)
                }
            }
        } catch (e: Exception) {
            log.error("Unable to approve suggestion", e)
            notificationEventService.notification(e.message ?: "Unable to approve suggestion", NotificationType.ERROR)
        }
    }

    @Task
    @Transactional
    fun calculateTotal(@TaskKey id: UUID, date: LocalDate) {
        withLock(id) {
            calculateTotal(id, listOf(date))
        }
    }

    private fun calculateTotal(id: UUID, affectedDates: List<LocalDate>) {
        if (affectedDates.isEmpty()) {
            return
        }
        importDataActionService.calculateTotal(id, affectedDates)

        importDataEventService.importData(id)
        importDataEventService.importDataEntry(id, affectedDates)
    }

    private fun withLock(id: UUID, block: () -> Unit) {
        importDataStateService.findAndLock(id) ?: return
        importDataEventService.importDataProgress(id, true)
        try {
            block()
        } finally {
            importDataStateService.findAndUnlock(id)
            importDataEventService.importDataProgress(id, false)
        }
    }

}
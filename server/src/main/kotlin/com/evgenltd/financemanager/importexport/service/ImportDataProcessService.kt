package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.operation.record.OperationEvent
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.service.OperationService
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.record.NotificationType
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.service.NotificationEventService
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionalEventListener
import java.io.InputStream
import java.time.LocalDate
import java.util.*

@Service
class ImportDataProcessService(
    private val importDataRepository: ImportDataRepository,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val importDataActionService: ImportDataActionService,
    private val importDataStateService: ImportDataStateService,
    private val importDataEventService: ImportDataEventService,
    private val operationService: OperationService,
    private val notificationEventService: NotificationEventService,
) {

    private val log: Logger = LoggerFactory.getLogger(ImportDataProcessService::class.java)

    fun importDataManage(id: UUID, progress: Boolean) {
        importDataEventService.importDataProgress(id, progress)
    }

    @Async
    fun beginNewImport(id: UUID, inputStream: InputStream) {
        try {

            importDataActionService.parseImportData(id, inputStream)

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

    @Async
    fun linkOperation(id: UUID, entryId: UUID, operationId: UUID) {
        try {
            runWithCalculationTotal(id) {
                importDataActionService.linkOperation(id, entryId, operationId)
            }
        } catch (e: Exception) {
            log.error("Unable to link operation", e)
            notificationEventService.notification(e.message ?: "Unable to link operation", NotificationType.ERROR)
        }
    }

    @Async
    fun linkOperation(id: UUID, entryId: UUID, operation: OperationRecord) {
        val result = operationService.update(operation) // recalculation by operation events
        importDataActionService.linkOperation(id, entryId, result.id!!)
    }

    @Async
    fun unlinkOperation(id: UUID, entryIds: List<UUID>) {
        if (entryIds.isEmpty()) {
            return
        }
        try {
            runWithCalculationTotal(id) {
                importDataActionService.unlinkOperation(id, entryIds)
            }
        } catch (e: Exception) {
            log.error("Unable to unlink operation", e)
            notificationEventService.notification(e.message ?: "Unable to unlink operation", NotificationType.ERROR)
        }
    }

    @Async
    fun entryVisibility(id: UUID, operationIds: List<UUID>, entryIds: List<UUID>, visible: Boolean) {
        try {
            runWithCalculationTotal(id) {
                importDataActionService.entryVisible(id, operationIds, entryIds, visible)
            }
        } catch (e: Exception) {
            log.error("Unable to change entry visibility", e)
            notificationEventService.notification(e.message ?: "Unable to change entry visibility", NotificationType.ERROR)
        }
    }

    @TransactionalEventListener
    @Async
    fun operationChanged(event: OperationEvent) {
        event.entries
            .asSequence()
            .flatMap { listOf(it.old, it.new) }
            .filterNotNull()
            .flatMap {
                listOf(
                    TransactionKey(it.date, it.accountFrom.id!!, it.accountFrom.type),
                    TransactionKey(it.date, it.accountTo.id!!, it.accountTo.type),
                )
            }
            .filter { it.accountType == AccountType.ACCOUNT }
            .distinct()
            .groupBy { it.accountId }
            .flatMap { (account, keys) ->
                importDataRepository.findByAccountId(account)
                    .map { importData -> importData to keys.map { key -> key.date } }
            }
            .onEach { (importData, affectedDates) ->
                runWithCalculationTotal(importData.id!!) {
                    affectedDates
                }
            }
    }

    private fun runWithCalculationTotal(id: UUID, block: () -> List<LocalDate>) {
        importDataStateService.findAndLock(id) ?: return
        importDataEventService.importDataProgress(id, true)
        try {
            val affectedDates = block().distinct()
            if (affectedDates.isEmpty()) {
                return
            }

            importDataActionService.calculateTotal(id, affectedDates)

            importDataEventService.importData(id)
            importDataEventService.importDataEntry(id, affectedDates)
        } finally {
            importDataStateService.findAndUnlock(id)
            importDataEventService.importDataProgress(id, false)
        }
    }

    private data class TransactionKey(val date: LocalDate, val accountId: UUID, val accountType: AccountType)

}
package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.operation.record.OperationEvent
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.service.OperationService
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.annotation.Order
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
    private val importDataService: ImportDataService,
    private val importDataActionService: ImportDataActionService,
    private val importDataStateService: ImportDataStateService,
    private val importDataEventService: ImportDataEventService,
    private val operationRepository: OperationRepository,
    private val operationService: OperationService,
//    @Qualifier(ExecutorConfig.BACKGROUND_CALCULATION_EXECUTOR)
//    private val executor: Executor,
) {

    private val log: Logger = LoggerFactory.getLogger(ImportDataProcessService::class.java)

    @Async
    fun beginNewImport(id: UUID, inputStream: InputStream) {
        try {
            importDataActionService.parseImportData(id, inputStream)
        } catch (e: Exception) {
            log.error("Unable to parse data", e)
        } finally {
            importDataStateService.findAndUnlock(id)
            importDataEventService.importData(id)
        }

//        val entryIds = importDataStateService.lockAllEntries(importDataId)
//
//        entryIds.chunked(50)
//            .onEach { ids ->
//                CompletableFuture.supplyAsync({ importDataActionService.prepareHintEmbeddings(ids) })
//                        .thenApplyAsync({ importDataActionService.interpretImportDataEntries(ids) })
//                        .thenApplyAsync({ importDataActionService.prepareFullEmbeddings(ids) })
//                        .exceptionally { log.error("Unable to handle entries", it) }
//                        .thenApply {
//                            importDataStateService.unlockEntries(ids)
//                        }
//            }

    }

    fun saveActualBalance(id: UUID, balance: Amount) {
        importDataActionService.saveActualBalance(id, balance)
        importDataEventService.importData(id)
    }

    @Async
    fun linkOperation(id: UUID, entryId: UUID, operationId: UUID) {
        try {
            runWithCalculationTotal(id) {
                importDataActionService.linkOperation(id, entryId, operationId)
            }
        } catch (e: Exception) {
            log.error("Unable to link operation", e)
        }
    }

    @Async
    @Transactional
    fun linkOperation(id: UUID, entryId: UUID, operation: OperationRecord) {
        val result = operationService.update(operation)
        importDataActionService.linkOperation(id, entryId, result.id!!)
    }

    @Async
    fun entryVisibility(id: UUID, operationIds: List<UUID>, entryIds: List<UUID>, visible: Boolean) {
        try {
            runWithCalculationTotal(id) {
                importDataActionService.entryVisible(id, operationIds, entryIds, visible)
            }
        } catch (e: Exception) {
            log.error("Unable to change entry visibility", e)
        }
    }

    fun entryApprove(id: UUID, entryId: UUID) {
//        importDataStateService.findAndLock(entryId)
//        // todo send in progress event
//        try {
//            val entryDate = importDataActionService.entryApprove(id, entryId)
////            importDataActionService.calculateDayTotal(id, entryDate)
////            importDataActionService.calculateTotal(id)
//            // todo send event
//        } catch (e: Exception) {
//            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to approve entry")
//        } finally {
//            importDataStateService.findAndUnlock(entryId)
//        }
    }

    @TransactionalEventListener
    @Order(20)
    @Async
    fun operationChanged(event: OperationEvent) {
        event.entries
            .asSequence()
            .flatMap { listOf(it.old, it.new) }
            .filterNotNull()
            .flatMap {
                listOf(
                    TransactionKey(it.date, it.accountFrom),
                    TransactionKey(it.date, it.accountTo),
                )
            }
            .filter { it.account.type == AccountType.ACCOUNT }
            .distinct()
            .groupBy { it.account }
            .flatMap { (account, keys) ->
                importDataRepository.findByAccount(account)
                    .map { importData -> importData to keys.map { key -> key.date} }
            }
            .onEach { (importData, affectedDates) ->
                runWithCalculationTotal(importData.id!!) {
                    affectedDates
                }
            }
    }

    private fun runWithCalculationTotal(id: UUID, block: () -> Collection<LocalDate>) {
        importDataStateService.findAndLock(id) ?: return
        importDataEventService.importDataProgress(id, true)
        try {
            val affectedDates = block()
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

    private data class TransactionKey(val date: LocalDate, val account: Account)

}
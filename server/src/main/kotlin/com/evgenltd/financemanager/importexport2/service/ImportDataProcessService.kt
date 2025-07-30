package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.repository.OperationRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.io.InputStream
import java.util.*

@Service
class ImportDataProcessService(
    private val importDataService: ImportDataService,
    private val importDataActionService: ImportDataActionService,
    private val importDataStateService: ImportDataStateService,
    private val importDataEventService: ImportDataEventService,
    private val operationRepository: OperationRepository,
//    @Qualifier(ExecutorConfig.BACKGROUND_CALCULATION_EXECUTOR)
//    private val executor: Executor,
) {

    private val log: Logger = LoggerFactory.getLogger(ImportDataProcessService::class.java)

    @Async
    fun beginNewImport(importDataId: UUID, inputStream: InputStream) {

        importDataActionService.parseImportData(importDataId, inputStream)
        importDataEventService.importData(importDataId)

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

    fun linkOperation(entryId: UUID, operationId: UUID) {
        val result = importDataActionService.linkOperation(entryId, operationId)
//        importDataActionService.calculateDayTotal(result.importDataId, result.entryDate)
//        if (result.operationDate != result.entryDate) {
//            importDataActionService.calculateDayTotal(result.importDataId, result.operationDate)
//        }
//        importDataActionService.calculateTotal(result.importDataId)
//        importDataEventService.importDataEntry(result.importDataId, listOf(entryId)) // todo, at least 2 events
    }

    fun operationVisible(id: UUID, operationId: UUID, visible: Boolean) {
        val operationDate = importDataActionService.operationVisible(id, operationId, visible) ?: return
//        importDataActionService.calculateDayTotal(id, operationDate)
//        importDataActionService.calculateTotal(id)
        // todo send event
    }

    fun entryVisible(id: UUID, entryId: UUID, visible: Boolean) {
        importDataStateService.findAndLock(entryId)
        // todo send in progress event
        try {
            val entryDate = importDataActionService.entryVisible(id, entryId, visible) ?: return
//            importDataActionService.calculateDayTotal(id, entryDate)
//            importDataActionService.calculateTotal(id)
            // todo send event
        } catch (e: Exception) {
            log.error("Unable to change entry visibility", e)
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to change entry visibility")
        } finally {
            importDataStateService.findAndUnlock(entryId)
        }
    }

    fun entryApprove(id: UUID, entryId: UUID) {
        importDataStateService.findAndLock(entryId)
        // todo send in progress event
        try {
            val entryDate = importDataActionService.entryApprove(id, entryId)
//            importDataActionService.calculateDayTotal(id, entryDate)
//            importDataActionService.calculateTotal(id)
            // todo send event
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to approve entry")
        } finally {
            importDataStateService.findAndUnlock(entryId)
        }
    }


}
package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.common.config.ExecutorConfig
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.operation.repository.OperationRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.InputStream
import java.util.UUID
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executor

@Service
class ImportDataProcessService(
    private val importDataService: ImportDataService,
    private val importDataActionService: ImportDataActionService,
    private val importDataStateService: ImportDataStateService,
    private val operationRepository: OperationRepository,
//    @Qualifier(ExecutorConfig.BACKGROUND_CALCULATION_EXECUTOR)
//    private val executor: Executor,
) {

    private val log: Logger = LoggerFactory.getLogger(ImportDataProcessService::class.java)

    @Async
    fun beginNewImport(importDataId: UUID, inputStream: InputStream) {

        importDataActionService.parseImportData(importDataId, inputStream)
        importDataActionService.sendImportData(importDataId)

        val entryIds = importDataStateService.lockAllEntries(importDataId)
        importDataActionService.sendImportDataEntry(importDataId, entryIds)

        entryIds.chunked(50)
            .onEach { ids ->
                CompletableFuture.supplyAsync({ importDataActionService.prepareHintEmbeddings(ids) })
                        .thenApplyAsync({ importDataActionService.interpretImportDataEntries(ids) })
                        .thenApplyAsync({ importDataActionService.prepareFullEmbeddings(ids) })
                        .exceptionally { log.error("Unable to handle entries", it) }
                        .thenApply {
                            importDataStateService.unlockEntries(ids)
                            importDataActionService.sendImportDataEntry(importDataId, ids)
                        }
            }

    }

    fun linkOperation(entryId: UUID, operationId: UUID) {
        val importDataId = importDataActionService.linkOperation(entryId, operationId)
        importDataActionService.sendImportDataEntry(importDataId, listOf(entryId))
    }

}
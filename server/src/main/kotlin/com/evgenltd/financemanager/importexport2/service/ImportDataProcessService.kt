package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.ai.service.AiProviderResolver
import com.evgenltd.financemanager.common.config.ExecutorConfig
import com.evgenltd.financemanager.common.repository.EmbeddingRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport.service.ImportDataProcessService
import com.evgenltd.financemanager.importexport2.record.ImportDataCreateRequest
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import java.io.InputStream
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executor

@Service
class ImportDataProcessService(
    private val importDataService: ImportDataService,
    private val importDataActionService: ImportDataActionService,
//    @Qualifier(ExecutorConfig.BACKGROUND_CALCULATION_EXECUTOR)
//    private val executor: Executor,
) {

    private val log: Logger = LoggerFactory.getLogger(ImportDataProcessService::class.java)

    @Async
    fun beginNewImport(data: ImportDataCreateRequest, inputStream: InputStream) {
        val importData = importDataService.save(data)

        importDataActionService.parseImportData(importData.id!!, inputStream)

//        val entryIds = importDataStateService.lockAllEntries()
//
//        entryIds.chunked(50)
//            .map {
//                CompletableFuture.allOf(
//                    CompletableFuture.supplyAsync({ importDataActionService.prepareHintEmbeddings() }, executor)
//                        .thenApplyAsync({ importDataActionService.interpretImportDataEntry() }, executor)
//                        .thenApplyAsync({ importDataActionService.prepareFullEmbeddings() }, executor)
//                ).exceptionally {
//                    log.error("", it)
//                    return@exceptionally null
//                }
//            }
//            .let { CompletableFuture.allOf(*it.toTypedArray()) }
    }


}
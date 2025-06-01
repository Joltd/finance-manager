package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.ai.service.AiProviderResolver
import com.evgenltd.financemanager.common.entity.Embedding
import com.evgenltd.financemanager.common.repository.EmbeddingRepository
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.operationEmbeddingInput
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport2.service.ImportDataProcessService
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.repository.OperationRepository
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import java.io.InputStream
import java.util.*
import java.util.concurrent.CompletableFuture

@Service
class ImportDataActionService(
    private val importDataService: ImportDataService,
    private val importDataProcessService: ImportDataProcessService,
    private val importDataParserResolver: ImportDataParserResolver,
    private val aiProviderResolver: AiProviderResolver,
    private val importDataRepository: ImportDataRepository,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val embeddingRepository: EmbeddingRepository,
    private val operationRepository: OperationRepository,
) {

    fun parseImportData(importDataId: UUID, stream: InputStream) {
        val importData = importDataRepository.find(importDataId)
        importDataParserResolver.resolve(importData.account.parser)
            .parse(importData, stream) // todo save warning if failed
            .map { ImportDataEntry(importData = importData, parsedEntry = it) }
            .let { importDataEntryRepository.saveAll(it) }
    }

    fun prepareHintEmbeddings(entryIds: List<UUID>) {
        val entries = importDataEntryRepository.findAllById(entryIds)
            .filter { !it.parsedEntry.hint.isNullOrBlank() && it.hint == null }

        aiProviderResolver.resolve()
            .embedding(entries.map { it.parsedEntry.hint!! })
            .mapIndexed { index, embedding ->
                entries[index]?.also { entry ->
                    entry.hint = Embedding(vector = embedding).let {
                        embeddingRepository.save(it)
                    }
                }
            }
            .mapNotNull { it }
            .let { importDataEntryRepository.saveAll(it) }
    }

    fun prepareFullEmbeddings(entryIds: List<UUID>) {
        val entries = importDataEntryRepository.findAllById(entryIds)
            .filter { it.full == null }

        aiProviderResolver.resolve()
            .embedding(entries.map { it.parsedEntry.full() })
            .mapIndexed { index, embedding ->
                entries[index]?.also { entry ->
                    entry.full = Embedding(vector = embedding).let {
                        embeddingRepository.save(it)
                    }
                }
            }
            .mapNotNull { it }
        importDataEntryRepository.saveAll(entries)
    }

    fun interpretImportDataEntry(entryId: UUID) {
        val entry = importDataEntryRepository.find(entryId)

        if (entry.parsedEntry.type !in listOf(OperationType.INCOME, OperationType.EXPENSE)) {
            return
        }

        val hint = entry.hint
        if (hint == null) {
            return
        }

        val importData = entry.importData
        operationRepository.findSimilarByHint(importData.account.id!!, entry.parsedEntry.type, hint.id!!)

        // load similar operations

        // get top suitable expence/income accounts

        // create suggestions + match percent

        // take first suggestion above threashold and make it primary/selected
    }

    fun prepareFullEmbeddingForSelectedSuggestion(entryIds: List<UUID>) {
        // perform only if entry has selected suggestion

        // take selected suggestion

        // if there is no full embedding for selected suggestion, then create it
    }

    private fun ImportDataParsedEntry.full(): String = operationEmbeddingInput(
        date = date,
        type = type,
        amountFrom = amountFrom,
        accountFrom = accountFrom?.name,
        amountTo = amountTo,
        accountTo = accountTo?.name,
    )

}
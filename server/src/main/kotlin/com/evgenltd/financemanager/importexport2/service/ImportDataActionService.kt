package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.common.component.patchEvent
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.operationEmbeddingInput
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataOperation
import com.evgenltd.financemanager.importexport.entity.ImportDataOperationType
import com.evgenltd.financemanager.importexport2.record.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataOperationRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.InputStream
import java.util.*

@Service
class ImportDataActionService(
    private val importDataParserResolver: ImportDataParserResolver,
    private val importDataRepository: ImportDataRepository,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val importDataOperationRepository: ImportDataOperationRepository,
    private val importDataConverter: ImportDataConverter,
    private val publisher: ApplicationEventPublisher,
) {

    fun parseImportData(importDataId: UUID, stream: InputStream) {
        val importData = importDataRepository.find(importDataId)
        try {
            importDataParserResolver.resolve(importData.account.parser)
                .parse(importData, stream)
                .map { saveParsedEntry(it, importData) }
        } catch (e: Exception) {
            TODO("Not yet implemented")
        }
    }

    private fun saveParsedEntry(entry: ImportDataParsedEntry, importData: ImportData) {
        val importDataEntry = importDataEntryRepository.save(ImportDataEntry(importData = importData))
        ImportDataOperation(
            importDataEntry = importDataEntry,
            importType = ImportDataOperationType.PARSED,
            date = entry.date,
            type = entry.type,
            amountFrom = entry.amountFrom,
            accountFrom = entry.accountFrom,
            amountTo = entry.amountTo,
            accountTo = entry.accountTo,
            description = entry.description,
            raw = entry.rawEntries,
            hintInput = entry.hint,
        ).also { importDataOperationRepository.save(it) }
    }

    fun prepareHintEmbeddings() {
        if (Math.random() > 0.5) {
            throw RuntimeException("test")
        }
//        val operations = importDataOperationRepository.findForHintEmbedding(entryIds, ImportDataOperationType.PARSED)
//
//        aiProviderResolver.resolve()
//            .embedding(operations.map { it.hintInput!! })
//            .mapIndexed { index, embedding ->
//                operations[index].also { operation ->
//                    operation.hint = Embedding(vector = embedding).let {
//                        embeddingRepository.save(it)
//                    }
//                }
//            }
//            .let { importDataOperationRepository.saveAll(it) }
    }

    fun prepareFullEmbeddings() {
//        val operations = importDataOperationRepository.findForFullEmbedding(entryIds)
//
//        aiProviderResolver.resolve()
//            .embedding(operations.map { it.fullInput() })
//            .mapIndexed { index, embedding ->
//                operations[index].also { operation ->
//                    operation.hint = Embedding(vector = embedding).let {
//                        embeddingRepository.save(it)
//                    }
//                }
//            }
//            .let { importDataOperationRepository.saveAll(it) }
    }

    fun interpretImportDataEntry() {
//        val operation = importDataOperationRepository.findForInterpretation(entryId, ImportDataOperationType.PARSED)
//            ?: return // todo ?
//
//        if (operation.type !in listOf(OperationType.INCOME, OperationType.EXPENSE)) {
//            return
//        }
//
//        val importDataEntry = operation.importDataEntry
//        val importData = importDataEntry.importData
//
//        operationRepository.findSimilarByHint(importData.account.id!!, operation.type, operation.hint?.id!!)
//            .map {
//                when (operation.type) {
//                    OperationType.INCOME -> it.operation.accountFrom
//                    OperationType.EXPENSE -> it.operation.accountTo
//                    else -> null
//                }!! to it.distance
//            }
//            .groupBy { it.first }
//            .mapValues { entries ->
//                entries.value.sumOf { 1.0 / (it.second + 1e-5) }
//            }
//            .toList()
//            .sortedByDescending { it.second }
//            .take(5)
//            .mapIndexed { index, it ->
//                ImportDataOperation(
//                    importDataEntry = importDataEntry,
//                    importType = ImportDataOperationType.SUGGESTION,
//                    selected = index == 0,
//                    distance = it.second,
//                    date = operation.date,
//                    type = operation.type,
//                    amountFrom = operation.amountFrom,
//                    accountFrom = if (operation.type == OperationType.INCOME) it.first else importData.account,
//                    amountTo = operation.amountTo,
//                    accountTo = if (operation.type == OperationType.EXPENSE) it.first else importData.account,
//                    description = operation.description,
//                    raw = operation.raw,
//                )
//            }
//            .let { importDataOperationRepository.saveAll(it) }
    }

    @Transactional
    fun sendImportData(id: UUID) {
        val importData = importDataRepository.find(id)
        val record = importDataConverter.toRecord(importData)
        val event = patchEvent(eventName(id), record)
        publisher.publishEvent(event)
    }

    private fun eventName(id: UUID) = "importData-$id"

    private fun ImportDataOperation.fullInput(): String = operationEmbeddingInput(
        date = date,
        type = type,
        amountFrom = amountFrom,
        accountFrom = accountFrom?.name,
        amountTo = amountTo,
        accountTo = accountTo?.name,
    )

}
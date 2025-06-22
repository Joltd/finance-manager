package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.ai.service.AiProviderResolver
import com.evgenltd.financemanager.common.component.patch
import com.evgenltd.financemanager.common.component.patchEvent
import com.evgenltd.financemanager.common.entity.Embedding
import com.evgenltd.financemanager.common.repository.EmbeddingRepository
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
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.context.ApplicationEventPublisher
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
    private val aiProviderResolver: AiProviderResolver,
    private val embeddingRepository: EmbeddingRepository,
    private val operationRepository: OperationRepository,
    private val publisher: ApplicationEventPublisher,
    private val accountRepository: AccountRepository,
) {

    fun parseImportData(id: UUID, stream: InputStream) {
        val importData = importDataRepository.find(id)
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

    fun prepareHintEmbeddings(entryIds: List<UUID>) {
        val operations = importDataOperationRepository.findForHintEmbedding(entryIds, ImportDataOperationType.PARSED)

        aiProviderResolver.resolve()
            .embedding(operations.map { it.hintInput!! })
            .mapIndexed { index, embedding ->
                operations[index].also { operation ->
                    operation.hint = Embedding(vector = embedding).let {
                        embeddingRepository.save(it)
                    }
                }
            }
            .let { importDataOperationRepository.saveAll(it) }
    }

    fun prepareFullEmbeddings(entryIds: List<UUID>) {
        val operations = importDataOperationRepository.findForFullEmbedding(entryIds)

        aiProviderResolver.resolve()
            .embedding(operations.map { it.fullInput() })
            .mapIndexed { index, embedding ->
                operations[index].also { operation ->
                    operation.hint = Embedding(vector = embedding).let {
                        embeddingRepository.save(it)
                    }
                }
            }
            .let { importDataOperationRepository.saveAll(it) }
    }

    fun interpretImportDataEntries(ids: List<UUID>) {
        importDataOperationRepository.findForInterpretation(ids, ImportDataOperationType.PARSED)
            .onEach { interpretImportDataEntry(it) }
    }

    fun interpretImportDataEntry(operation: ImportDataOperation) {
        fillAccounts(operation)

        if (operation.type !in listOf(OperationType.INCOME, OperationType.EXPENSE)) {
            return
        }

        val importDataEntry = operation.importDataEntry
        val importData = importDataEntry.importData

        val similar = operationRepository.findSimilarByHint(importData.account.id!!, operation.type.name, operation.hint?.id!!)
        val accounts = accountRepository.findAllById(similar.map { it.accountId })
        similar.zip(accounts)
            .mapIndexed { index, it ->
                ImportDataOperation(
                    importDataEntry = importDataEntry,
                    importType = ImportDataOperationType.SUGGESTION,
                    selected = index == 0,
                    distance = it.first.score,
                    date = operation.date,
                    type = operation.type,
                    amountFrom = operation.amountFrom,
                    accountFrom = if (operation.type == OperationType.INCOME) it.second else importData.account,
                    amountTo = operation.amountTo,
                    accountTo = if (operation.type == OperationType.EXPENSE) it.second else importData.account,
                    description = operation.description,
                    raw = operation.raw,
                )
            }
            .let { importDataOperationRepository.saveAll(it) }
    }

    private fun fillAccounts(operation: ImportDataOperation) {
        val entry = operation.importDataEntry
        val importData = entry.importData

        if (operation.accountFrom == null && operation.type == OperationType.EXPENSE) {
            operation.accountFrom = importData.account
        }

        if (operation.accountTo == null && operation.type == OperationType.INCOME) {
            operation.accountTo = importData.account
        }

        importDataOperationRepository.save(operation)
    }

    @Transactional
    fun linkOperation(entryId: UUID, operationId: UUID): UUID {
        val entry = importDataEntryRepository.find(entryId)
        val operation = operationRepository.find(operationId)
        entry.operation = operation
        return entry.importData.id!!
    }

    //

    @Transactional
    fun sendImportData(id: UUID) {
        val importData = importDataRepository.find(id)
        val record = importDataConverter.toRecord(importData)
        val patch = patch(record)
        val event = patchEvent(eventName(id), listOf(patch))
        publisher.publishEvent(event)
    }

    @Transactional
    fun sendImportDataEntry(importDataId: UUID, importDataEntryIds: List<UUID>) {
        importDataEntryRepository.findAllById(importDataEntryIds)
            .map { entry ->
                val record = importDataConverter.toRecord(entry)
                patch(record) {
                    it.path("entries").path("id", entry.id.toString())
                }
            }
            .let { patchEvent(eventName(importDataId), it) }
            .let { publisher.publishEvent(it) }
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
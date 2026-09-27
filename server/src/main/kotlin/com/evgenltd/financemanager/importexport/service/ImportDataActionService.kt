package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.ai.service.EmbeddingActionService
import com.evgenltd.financemanager.common.record.TransactionDirection
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.service.LockService
import com.evgenltd.financemanager.common.util.fromFractionalString
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataDay
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataParsingStatus
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.repository.ImportDataDayRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.operation.entity.OperationData
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.repository.OperationDataRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class ImportDataActionService(
    private val importDataParserResolver: ImportDataParserResolver,
    private val importDataRepository: ImportDataRepository,
    private val importDataDayRepository: ImportDataDayRepository,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val operationDataRepository: OperationDataRepository,
    private val embeddingActionService: EmbeddingActionService,
    private val lockService: LockService,
) {

    fun withTryLock(id: UUID?, block: () -> Unit): Boolean =
        lockService.withTryLockEntity(
            entityName = ImportData::class.simpleName!!,
            id = id!!,
            block = block,
        )

    fun <T> withLock(id: UUID?, block: () -> T): T =
        lockService.withLockEntity(
            entityName = ImportData::class.simpleName!!,
            id = id!!,
            block = block,
        )

    fun parseImportData(id: UUID, filename: String): List<ImportDataParsedEntry> {
        val importData = importDataRepository.find(id)
        return importDataParserResolver.resolve(importData.account.parser).parse(importData, filename)
    }

    @Transactional
    fun prepareImportData(id: UUID, parsedEntries: List<ImportDataParsedEntry>): List<UUID> {
        val importData = importDataRepository.find(id)
        val days = parsedEntries
            .map { it.date }
            .distinct()
            .map { date -> ImportDataDay(importData = importData, date = date) }
            .let { importDataDayRepository.saveAll(it) }
            .associateBy { it.date }

        return parsedEntries.map { parsed ->
            val operationData = OperationData(
                transactionId = parsed.transactionId,
                mcc = parsed.mcc,
                bankType = parsed.bankType,
                bankCategory = parsed.bankCategory,
                merchant = parsed.merchant,
                counterparty = parsed.counterparty,
                purpose = parsed.purpose,
                raw = parsed.raw,
            ).let { operationDataRepository.save(it) }

            val type = when (parsed.direction) {
                TransactionDirection.IN -> OperationType.INCOME
                TransactionDirection.OUT -> OperationType.EXPENSE
                null -> null
            }
            val amount = if (parsed.amount != null && parsed.currency != null) {
                runCatching { fromFractionalString(parsed.amount, parsed.currency).abs() }.getOrNull()
            } else {
                null
            }

            ImportDataEntry(
                importDataDay = days.getValue(parsed.date),
                operationData = operationData,
                date = parsed.date,
                type = type,
                amountFrom = amount,
                accountFrom = importData.account.takeIf { type == OperationType.EXPENSE },
                amountTo = amount,
                accountTo = importData.account.takeIf { type == OperationType.INCOME },
                description = parsed.description,
            ).let { importDataEntryRepository.save(it) }
        }.map { it.id!! }
    }

    fun prepareHintEmbeddings(entryIds: List<UUID>) {
        val operationData = importDataEntryRepository.findOperationDataWithoutHint(entryIds)
        if (operationData.isEmpty()) {
            return
        }

        val embeddings = operationData
            .map { hintInput(it) }
            .let { embeddingActionService.prepareEmbeddings(it) }

        operationData.zip(embeddings).forEach { (data, embedding) -> data.hint = embedding }
        operationDataRepository.saveAll(operationData)
    }

    internal fun hintInput(data: OperationData): String {
        val facts = listOfNotNull(
            data.bankType?.let { "bankType: $it" },
            data.bankCategory?.let { "bankCategory: $it" },
            data.merchant?.let { "merchant: $it" },
            data.counterparty?.let { "counterparty: $it" },
            data.purpose?.let { "purpose: $it" },
            data.mcc?.let { "mcc: $it" },
        ).filterNot { it.substringAfter(':').isBlank() }

        return facts.joinToString("\n").ifBlank { data.raw }
    }

    fun prepareSuggestions(@Suppress("UNUSED_PARAMETER") id: UUID) = Unit

    fun linkEntries(@Suppress("UNUSED_PARAMETER") id: UUID) = Unit

    fun calculateTotals(@Suppress("UNUSED_PARAMETER") id: UUID) = Unit

    @Transactional
    fun updateParsingStatus(id: UUID, status: ImportDataParsingStatus, message: String? = null) {
        val importData = importDataRepository.find(id)
        importData.parsingStatus = status
        importData.message = message
    }

    fun delete(id: UUID) {
        importDataRepository.deleteById(id)
    }
}

package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.ai.service.EmbeddingActionService
import com.evgenltd.financemanager.common.record.TransactionDirection
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.contains
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.service.LockService
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.common.util.fromFractionalString
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataDay
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataParsingStatus
import com.evgenltd.financemanager.importexport.entity.ImportDataSuggestion
import com.evgenltd.financemanager.importexport.entity.emptyTotal
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.repository.ImportDataDayRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataSuggestionRepository
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationData
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.repository.OperationDataRepository
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.service.amountsForAccount
import com.evgenltd.financemanager.operation.service.byAccount
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class ImportDataActionService(
    private val importDataParserResolver: ImportDataParserResolver,
    private val importDataRepository: ImportDataRepository,
    private val importDataDayRepository: ImportDataDayRepository,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val importDataSuggestionRepository: ImportDataSuggestionRepository,
    private val operationDataRepository: OperationDataRepository,
    private val operationRepository: OperationRepository,
    private val accountRepository: AccountRepository,
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

    @Transactional
    fun prepareSuggestions(id: UUID) {
        importDataRepository.find(id)

        importDataEntryRepository.findForSuggestions(id).forEach { entry ->
            entry.suggestions.clear()

            val scores = importDataEntryRepository.findSimilarAccountsByHint(entry.id!!)
            val accounts = accountRepository.findAllById(scores.map { it.accountId })
                .associateBy { it.id!! }
            val suggestions = scores.mapNotNull { candidate ->
                accounts[candidate.accountId]?.let { account ->
                    ImportDataSuggestion(
                        importDataEntry = entry,
                        account = account,
                        description = entry.description,
                        score = candidate.score,
                    )
                }
            }

            importDataSuggestionRepository.saveAll(suggestions)
            entry.suggestions.addAll(suggestions)

            suggestions.firstOrNull()
                ?.takeIf { it.score > AUTO_SELECT_SCORE }
                ?.let { best ->
                    when (entry.type) {
                        OperationType.EXPENSE -> entry.accountTo = best.account
                        OperationType.INCOME -> entry.accountFrom = best.account
                        else -> Unit
                    }
                }
        }
    }

    @Transactional
    fun linkEntries(id: UUID) {
        val importData = importDataRepository.find(id)
        val entries = importDataEntryRepository.findEntriesByImportDataId(id)
        val dates = entries.mapNotNull { it.date }.distinct()
        if (dates.isEmpty()) {
            return
        }

        val linkedOperationIds = entries.mapNotNull { it.operation?.id }.toSet()
        val operationIndex = ((Operation::date contains dates) and byAccount(importData.account))
            .let { operationRepository.findAll(it) }
            .asSequence()
            .filterNot { it.id in linkedOperationIds }
            .sortedBy { it.id }
            .groupBy { it.key() }
            .mapValues { (_, operations) -> ArrayDeque(operations) }
            .toMutableMap()

        entries.asSequence()
            .filter { it.operation == null }
            .sortedWith(compareBy<ImportDataEntry> { it.date }.thenBy { it.id })
            .forEach { entry ->
                val key = entry.keyOrNull() ?: return@forEach
                val candidates = operationIndex[key] ?: return@forEach
                entry.operation = candidates.removeFirst()
                if (candidates.isEmpty()) {
                    operationIndex.remove(key)
                }
            }
    }

    @Transactional
    fun calculateTotals(id: UUID) {
        val importData = importDataRepository.find(id)
        val entries = importDataEntryRepository.findEntriesByImportDataId(id)
        val entriesByDay = entries.groupBy { it.importDataDay.id }
        val dates = importData.days.mapNotNull { it.date }.distinct()
        val operationsByDate = if (dates.isEmpty()) {
            emptyMap()
        } else {
            ((Operation::date contains dates) and byAccount(importData.account))
                .let { operationRepository.findAll(it) }
                .groupBy { it.date }
        }

        importData.days.forEach { day ->
            val parsed = entriesByDay[day.id].orEmpty()
                .filter { it.isParsed() }
                .flatMap { it.amountsForAccount(importData.account) }
                .totalByCurrency()
            val operation = day.date
                ?.let { operationsByDate[it] }
                .orEmpty()
                .amountsForAccount(importData.account)
                .totalByCurrency()
            val currencies = (parsed.keys + operation.keys)
                .filter { importData.currency == null || it == importData.currency }
                .sorted()

            day.totals.clear()
            day.totals.addAll(currencies.map { currency ->
                emptyTotal(currency).also { total ->
                    total.importDataDay = day
                    total.parsed = parsed[currency] ?: emptyAmount(currency)
                    total.operation = operation[currency] ?: emptyAmount(currency)
                }
            })
            day.valid = false
        }

        importData.totals.clear()
        importData.totals.addAll(
            importData.days
                .flatMap { it.totals }
                .groupBy { it.currency }
                .toSortedMap()
                .map { (currency, totals) ->
                    emptyTotal(currency).also { total ->
                        total.importData = importData
                        total.parsed = totals.map { it.parsed }.sum(currency)
                        total.operation = totals.map { it.operation }.sum(currency)
                    }
                },
        )
        importData.valid = false
    }

    @Transactional
    fun updateParsingStatus(id: UUID, status: ImportDataParsingStatus, message: String? = null) {
        val importData = importDataRepository.find(id)
        importData.parsingStatus = status
        importData.message = message
    }

    fun delete(id: UUID) {
        importDataRepository.deleteById(id)
    }

    private data class OperationKey(
        val date: java.time.LocalDate,
        val type: OperationType,
        val amountFrom: Amount,
        val accountFrom: UUID,
        val amountTo: Amount,
        val accountTo: UUID,
    )

    private fun Operation.key(): OperationKey = OperationKey(
        date = date,
        type = type,
        amountFrom = amountFrom,
        accountFrom = accountFrom.id!!,
        amountTo = amountTo,
        accountTo = accountTo.id!!,
    )

    private fun ImportDataEntry.keyOrNull(): OperationKey? = OperationKey(
        date = date ?: return null,
        type = type ?: return null,
        amountFrom = amountFrom ?: return null,
        accountFrom = accountFrom?.id ?: return null,
        amountTo = amountTo ?: return null,
        accountTo = accountTo?.id ?: return null,
    )

    private fun ImportDataEntry.isParsed(): Boolean =
        date != null && type != null && amountFrom != null && amountTo != null

    private fun ImportDataEntry.amountsForAccount(account: Account): List<Amount> = listOfNotNull(
        amountFrom?.takeIf { accountFrom == account }?.let { -it },
        amountTo?.takeIf { accountTo == account },
    )

    private fun List<Amount>.totalByCurrency(): Map<String, Amount> =
        groupBy { it.currency }.mapValues { (currency, amounts) -> amounts.sum(currency) }

    private fun List<Amount>.sum(currency: String): Amount =
        fold(emptyAmount(currency)) { total, amount -> total + amount }

    private companion object {
        const val AUTO_SELECT_SCORE = 1.0
    }
}

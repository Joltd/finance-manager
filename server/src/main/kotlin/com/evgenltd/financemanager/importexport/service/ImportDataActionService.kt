package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.ai.service.EmbeddingActionService
import com.evgenltd.financemanager.common.record.TransactionDirection
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.contains
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.service.LockService
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.common.util.badRequestException
import com.evgenltd.financemanager.common.util.fromFractionalString
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataDay
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataParsingStatus
import com.evgenltd.financemanager.importexport.entity.ImportDataSuggestion
import com.evgenltd.financemanager.importexport.entity.emptyTotal
import com.evgenltd.financemanager.importexport.record.ImportDataEntryUpdateRecord
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.repository.ImportDataDayRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataSuggestionRepository
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationData
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.record.OperationChangeRecord
import com.evgenltd.financemanager.operation.repository.OperationDataRepository
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.service.OperationService
import com.evgenltd.financemanager.operation.service.amountsForAccount
import com.evgenltd.financemanager.operation.service.byAccount
import org.hibernate.Hibernate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
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
    private val importDataConverter: ImportDataConverter,
    private val operationService: OperationService,
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
            )
                .also { it.refreshValid() }
                .let { importDataEntryRepository.save(it) }
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
            entry.refreshValid()
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

        importData.days.forEach { day ->
            val parsedEntries = entriesByDay[day.id].orEmpty().filter { it.isParsed() }
            val parsed = parsedEntries
                .filter { it.operation == null }
                .flatMap { it.amountsForAccount(importData.account) }
                .totalByCurrency()
            // currencies of linked entries are kept, so a fully linked currency still has a (zero) total
            val currencies = parsedEntries
                .flatMap { it.amountsForAccount(importData.account) }
                .map { it.currency }
                .filter { importData.currency == null || it == importData.currency }
                .distinct()
                .sorted()

            day.totals.clear()
            day.totals.addAll(currencies.map { currency ->
                emptyTotal(currency).also { total ->
                    total.importDataDay = day
                    total.parsed = parsed[currency] ?: emptyAmount(currency)
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
                    }
                },
        )
        importData.valid = false
    }

    @Transactional
    fun commit(id: UUID): List<OperationChangeRecord> {
        val importData = importDataRepository.find(id)
        if (importData.parsingStatus != ImportDataParsingStatus.DONE) {
            throw badRequestException("Import is not ready for commit")
        }

        val pairs = importDataEntryRepository.findForCommit(id)
            .map { entry -> entry to importDataConverter.toOperationRecord(entry) }
        if (pairs.isEmpty()) {
            return emptyList()
        }

        val changes = operationService.save(pairs.map { (_, operation) -> operation })
        pairs.forEach { (entry, operation) -> entry.operation = operation }

        val account = importData.account
        val lastDate = pairs.maxOf { (_, operation) -> operation.date }
        account.reviseDate = account.reviseDate
            ?.let { maxOf(it, lastDate) }
            ?: lastDate

        calculateTotals(id)
        return changes
    }

    @Transactional
    fun updateEntry(id: UUID, entryId: UUID, record: ImportDataEntryUpdateRecord): List<LocalDate> {
        val importData = importDataRepository.find(id)
        if (importData.parsingStatus != ImportDataParsingStatus.DONE) {
            throw badRequestException("Import is not ready for editing")
        }
        val entry = importDataEntryRepository.find(entryId)
        if (entry.importDataDay.importData.id != importData.id) {
            throw badRequestException("Entry does not belong to the import")
        }
        if (entry.operation != null) {
            throw badRequestException("Entry is already linked to an operation")
        }

        val accountFrom = record.accountFrom?.let { accountRepository.find(it.id) }
        val accountTo = record.accountTo?.let { accountRepository.find(it.id) }
        validateEntryAccounts(importData.account, record.type, accountFrom, accountTo)

        val oldDate = entry.date
        if (oldDate != record.date) {
            moveToDay(importData, entry, record.date)
        }

        entry.type = record.type
        entry.amountFrom = record.amountFrom
        entry.accountFrom = accountFrom
        entry.amountTo = record.amountTo
        entry.accountTo = accountTo
        entry.description = record.description
        entry.refreshValid()

        calculateTotals(id)
        return listOfNotNull(oldDate, record.date).distinct()
    }

    // todo move to common place
    private fun validateEntryAccounts(
        importAccount: Account,
        type: OperationType,
        accountFrom: Account?,
        accountTo: Account?,
    ) {
        val counterpart = when (type) {
            OperationType.EXPENSE -> {
                if (accountFrom?.id != importAccount.id) {
                    throw badRequestException("Expense must be paid from the import account")
                }
                accountTo
            }
            OperationType.INCOME -> {
                if (accountTo?.id != importAccount.id) {
                    throw badRequestException("Income must be received to the import account")
                }
                accountFrom
            }
            OperationType.TRANSFER, OperationType.EXCHANGE -> when (importAccount.id) {
                accountFrom?.id -> accountTo
                accountTo?.id -> accountFrom
                else -> throw badRequestException("Import account must be one of the operation sides")
            }
        }

        val counterpartType = when (type) {
            OperationType.EXPENSE -> AccountType.EXPENSE
            OperationType.INCOME -> AccountType.INCOME
            OperationType.TRANSFER, OperationType.EXCHANGE -> AccountType.ACCOUNT
        }
        if (counterpart != null && counterpart.type != counterpartType) {
            throw badRequestException("Invalid counterpart account type for $type")
        }
        if (type == OperationType.TRANSFER && accountFrom != null && accountFrom.id == accountTo?.id) {
            throw badRequestException("Transfer accounts must differ")
        }
    }

    private fun moveToDay(importData: ImportData, entry: ImportDataEntry, date: LocalDate) {
        val oldDay = entry.importDataDay
        // calculateTotals iterates importData.days, so the collection is loaded up front and kept in
        // sync below instead of relying on queued changes of a lazy collection
        Hibernate.initialize(importData.days)
        val newDay = importDataDayRepository
            .findOne((ImportDataDay::importData eq importData) and (ImportDataDay::date eq date))
            .orElse(null)
            ?: importDataDayRepository.save(ImportDataDay(importData = importData, date = date))
                .also { importData.days.add(it) }

        // oldDay.entries is deliberately left untouched: it has orphanRemoval, so removing the entry
        // from that collection would delete the entry itself
        entry.importDataDay = newDay
        entry.date = date
        importDataEntryRepository.flush()

        // after the flush the old day's entries are read from the database, so deleting an emptied
        // day cascades to nothing but its totals
        if (!importDataEntryRepository.existsByImportDataDay(oldDay)) {
            importData.days.remove(oldDay)
        }
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

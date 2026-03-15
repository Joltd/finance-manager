package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.ai.service.EmbeddingActionService
import com.evgenltd.financemanager.common.repository.*
import com.evgenltd.financemanager.common.service.LockService
import com.evgenltd.financemanager.common.service.until
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.common.util.badRequestException
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.importexport.entity.*
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.record.OperationKey
import com.evgenltd.financemanager.importexport.repository.*
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.entity.Operational
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.service.OperationProcessService
import com.evgenltd.financemanager.operation.service.amountsForAccount
import com.evgenltd.financemanager.operation.service.byAccount
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.InputStream
import java.time.LocalDate
import java.util.*

@Service
class ImportDataActionService(
    private val importDataParserResolver: ImportDataParserResolver,
    private val importDataRepository: ImportDataRepository,
    private val importDataDayRepository: ImportDataDayRepository,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val importDataOperationRepository: ImportDataOperationRepository,
    private val importDataTotalRepository: ImportDataTotalRepository,
    private val importDataConverter: ImportDataConverter,
    private val embeddingActionService: EmbeddingActionService,
    private val operationProcessService: OperationProcessService,
    private val operationRepository: OperationRepository,
    private val accountRepository: AccountRepository,
    private val balanceRepository: BalanceRepository,
    private val lockService: LockService,
) : Loggable() {

    @Transactional
    fun startProgress(id: UUID) {
        val importData = importDataRepository.find(id)
        importData.progress = true
    }

    @Transactional
    fun endProgress(id: UUID) {
        val importData = importDataRepository.find(id)
        importData.progress = false
    }

    fun withLock(id: UUID?, block: () -> Unit) {
        lockService.withLockEntity(
            entityName = ImportData::class.simpleName!!,
            id = id!!,
            block = block
        )
    }

    fun withTryLock(id: UUID?, block: () -> Unit): Boolean =
        lockService.withTryLockEntity(
            entityName = ImportData::class.simpleName!!,
            id = id!!,
            block = block
        )

    @Transactional
    fun parseImportData(id: UUID, stream: InputStream) {
        val importData = importDataRepository.find(id)
        val entries = importDataParserResolver.resolve(importData.account.parser).parse(importData, stream)
        val days = prepareDays(entries, importData)
        for (entry in entries) {
            prepareEntry(entry, importData, days)
        }
    }

    private fun prepareDays(entries: List<ImportDataParsedEntry>, importData: ImportData): Map<LocalDate, ImportDataDay> =
        entries.map { it.date }
            .distinct()
            .map { ImportDataDay(importData = importData, date = it) }
            .let { importDataDayRepository.saveAll(it) }
            .associateBy { it.date }

    private fun prepareEntry(entry: ImportDataParsedEntry, importData: ImportData, days: Map<LocalDate, ImportDataDay>) {
        val day = days[entry.date] ?: throw RuntimeException("ImportDataDay for date ${entry.date} not found")
        val importDataEntry = ImportDataEntry(
            importDataDay = day,
        ).let { importDataEntryRepository.save(it) }

        ImportDataOperation(
            importDataEntry = importDataEntry,
            importType = ImportDataOperationType.PARSED,
            date = entry.date,
            type = entry.type,
            amountFrom = entry.amountFrom,
            accountFrom = entry.accountFrom ?: importData.account.takeIf { entry.type == OperationType.EXPENSE },
            amountTo = entry.amountTo,
            accountTo = entry.accountTo ?: importData.account.takeIf { entry.type == OperationType.INCOME },
            description = entry.description,
            raw = entry.rawEntries,
            hintInput = entry.hint,
        ).let { importDataOperationRepository.save(it) }
    }

    fun prepareHintEmbeddings(entryIds: List<UUID>) {
        val operations = importDataOperationRepository.findForHintEmbedding(entryIds, ImportDataOperationType.PARSED)

        operations.map { it.hintInput!! }
            .let { embeddingActionService.prepareEmbeddings(it) }
            .zip(operations) { embedding, operation -> operation.hint = embedding }

        importDataOperationRepository.saveAll(operations)
    }

    fun interpretImportDataEntries(ids: List<UUID>) {
        importDataOperationRepository.findForInterpretation(ids, ImportDataOperationType.PARSED)
            .onEach {
                interpretImportDataEntry(it)
            }
    }

    private fun interpretImportDataEntry(parsed: ImportDataOperation) {
        fillAccounts(parsed)

        if (parsed.type !in listOf(OperationType.INCOME, OperationType.EXPENSE)) {
            return
        }

        val importDataEntry = parsed.importDataEntry
        val importData = importDataEntry.importDataDay.importData

        val similarIndex = importDataOperationRepository.findSimilarAccountsByHint(parsed.id!!)
            .associate { it.accountId to it.score }

        accountRepository.findAllById(similarIndex.keys)
            .asSequence()
            .associateWith { similarIndex[it.id!!] }
            .mapNotNull { (account, score) ->
                score?.let { account to score }
            }
            .map { (account, score) ->
                ImportDataOperation(
                    importDataEntry = importDataEntry,
                    importType = ImportDataOperationType.SUGGESTION,
                    selected = false,
                    score = score,
                    date = parsed.date,
                    type = parsed.type,
                    amountFrom = parsed.amountFrom,
                    accountFrom = account.takeIf { parsed.type == OperationType.INCOME } ?: importData.account,
                    amountTo = parsed.amountTo,
                    accountTo = account.takeIf { parsed.type == OperationType.EXPENSE } ?: importData.account,
                    description = parsed.description,
                    raw = parsed.raw,
                )
            }
            .let { importDataOperationRepository.saveAll(it) }

            .filter { isFairSuggestionRating(it.score) }
            .sortedByDescending { it.score }
            .firstOrNull()
            ?.let {
                it.selected = true
                importDataOperationRepository.save(it)
            }
    }

    private fun fillAccounts(operation: ImportDataOperation) {
        val entry = operation.importDataEntry
        val importData = entry.importDataDay.importData

        if (operation.accountFrom == null && operation.type == OperationType.EXPENSE) {
            operation.accountFrom = importData.account
        }

        if (operation.accountTo == null && operation.type == OperationType.INCOME) {
            operation.accountTo = importData.account
        }

        importDataOperationRepository.save(operation)
    }

    @Transactional
    fun linkExistedOperations(id: UUID) {
        val importData = importDataRepository.find(id)
        val range = importDataDayRepository.findImportDataDateRange(importData) ?: return

        generateSequence(range.min) { it.plusWeeks(1L) }
            .takeWhile { it <= range.max }
            .toList()
            .onEach {
                linkExistedOperations(importData, it)
            }

    }

    private fun linkExistedOperations(importData: ImportData, week: LocalDate) {
        val range = week until week.plusWeeks(1)

        val operationIndex = (byAccount(importData.account) and (Operation::date between range))
            .let { operationRepository.findAll(it) }
            .groupBy { it.key() }
            .mapValues { it.value.toMutableList() }
            .toMutableMap()

        ((ImportDataDay::importData eq importData) and (ImportDataDay::date between range))
            .let { importDataDayRepository.findAll(it) }
            .flatMap { it.entries }
            .onEach {
                linkExistedOperations(it, operationIndex)
            }
    }

    private fun linkExistedOperations(entry: ImportDataEntry, operationIndex: MutableMap<OperationKey, MutableList<Operation>>) {
        for (suggested in entry.suggested()) {
            if (suggested.accountFrom == null && suggested.accountTo == null) {
                continue
            }

            val key = suggested.key()
            val candidates = operationIndex[key] ?: continue

            val operation = candidates.removeFirst()
            if (candidates.isEmpty()) {
                operationIndex.remove(key)
            }

            linkOperation(entry, operation)
            entry.suggested().onEach { it.selected = false }

            return
        }
    }

    private fun Operation.key(): OperationKey = OperationKey(
        date = date,
        type = type,
        amountFrom = amountFrom,
        accountFrom = accountFrom.id!!,
        amountTo = amountTo,
        accountTo = accountTo.id!!,
    )

    private fun ImportDataOperation.key(): OperationKey = OperationKey(
        date = date,
        type = type,
        amountFrom = amountFrom,
        accountFrom = accountFrom?.id!!,
        amountTo = amountTo,
        accountTo = accountTo?.id!!,
    )

    @Transactional
    fun saveActualBalance(id: UUID, balance: Amount) {
        val importData = importDataRepository.find(id)
        importDataTotalRepository.findByImportData(importData)
            .firstOrNull { it.currency == balance.currency }
            ?.let { it.actual = balance }
            ?: let {
                emptyTotal(balance.currency)
                    .also {
                        it.actual = balance
                        it.importData = importData
                    }
                    .let { importDataTotalRepository.save(it) }
            }
    }

    @Transactional
    fun finish(id: UUID) {
        val importData = importDataRepository.find(id)
        importData.account.reviseDate = LocalDate.now()
        importDataRepository.delete(importData)
    }

    @Transactional
    fun linkOperation(id: UUID, entryId: UUID, operationId: UUID): List<LocalDate> {
        val importData = importDataRepository.find(id)
        val entry = importDataEntryRepository.find(entryId)

        val alreadyLinked = importDataEntryRepository.existsByImportDataDayImportDataAndOperationId(importData, operationId)
        if (alreadyLinked) {
            throw badRequestException("Operation already linked to another entry")
        }

        val operation = operationRepository.find(operationId)

//        if (entry.date != operation.date) {
//            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Operation date does not match entry date")
//        }

        linkOperation(entry, operation)

        importData.hiddenOperations.removeIf { it == operationId }

        return listOf(operation.date, entry.importDataDay.date)
    }

    private fun linkOperation(entry: ImportDataEntry, operation: Operation) {
        entry.operation = operation

        entry.parsed().firstOrNull()?.let {
            operation.raw = it.raw
            operation.hint = it.hint
        }
    }

    @Transactional
    fun unlinkOperation(id: UUID, entryIds: List<UUID>): List<LocalDate> =
        importDataEntryRepository.findAllById(entryIds)
            .flatMap {
                val operationDate = it.operation?.date
                it.operation?.raw = emptyList()
                it.operation?.hint = null
                it.operation = null
                listOf(operationDate, it.importDataDay.date)
            }
            .mapNotNull { it }
            .distinct()

    @Transactional
    fun entryVisible(id: UUID, operationIds: List<UUID>, entryIds: List<UUID>, visible: Boolean): List<LocalDate> {
        val importData = importDataRepository.find(id)

        val affectedEntryDates = importDataEntryRepository.findByIdInAndVisible(entryIds, !visible)
            .onEach { it.visible = visible }
            .map { it.importDataDay.date }

        val affectedOperationIds = if (visible) {
            operationIds.filter { it in importData.hiddenOperations }
                .toSet()
                .also { importData.hiddenOperations.removeAll(it) }
        } else {
            operationIds.filter { it !in importData.hiddenOperations }
                .toSet()
                .also { importData.hiddenOperations.addAll(it) }
        }

        val affectedOperationDates = operationRepository.findAllById(affectedOperationIds)
            .map { it.date }

        return affectedEntryDates + affectedOperationDates
    }

    @Transactional
    fun approveSuggestion(id: UUID, entryIds: List<UUID>): List<Pair<UUID, UUID>> {
        importDataRepository.find(id)
        return importDataEntryRepository.findAllById(entryIds)
            .mapNotNull { entry ->
                entry.suggested()
                    .firstOrNull { it.selected }
                    ?.let { entry.id!! to it }
            }
            .let { entryOperation ->
                val result = entryOperation.map { importDataConverter.toOperationRecord(it.second) }
                    .let { operationProcessService.save(it) }
                entryOperation.map { (entryId, _) -> entryId }.zip(result)
            }
    }

    @Transactional
    fun calculateTotal(id: UUID, dates: List<LocalDate>? = null) {
        val importData = importDataRepository.find(id)
        val account = importData.account

        val freeOperations = loadFreeOperations(importData)

        importData.days
            .filter { dates == null || it.date in dates }
            .onEach { calculateDayTotal(it, account, freeOperations[it.date]) }

        calculateGrandTotal(importData)

        importData.valid = importData.totals.all { it.valid }
    }

    private fun loadFreeOperations(importData: ImportData, dates: List<LocalDate>? = null): Map<LocalDate, List<Operation>> {
        val actualDates = dates ?: importData.days.map { it.date }
        val linkedOperations = importData.days
            .asSequence()
            .flatMap { it.entries }
            .mapNotNull { it.operation }
            .mapNotNull { it.id }
            .toList()


        return ((Operation::date contains actualDates) and
                byAccount(importData.account) and
                (Operation::id containsNot linkedOperations))
            .let { operationRepository.findAll(it) }
            .groupBy { it.date }
    }

    private fun calculateDayTotal(day: ImportDataDay, account: Account, freeOperations: List<Operational>?) {
        val parsedTotals = day.entries
            .flatMap { it.parsed() }
            .totalByCurrency(account)

        val suggestionTotals = day.entries
            .filter { it.operation == null }
            .flatMap { it.selectedSuggestion() }
            .totalByCurrency(account)

        val linkedOperationTotals = day.entries
            .mapNotNull { it.operation }
            .totalByCurrency(account)

        val freeOperationTotals = freeOperations?.totalByCurrency(account) ?: emptyMap()

        val operationTotals = linkedOperationTotals + freeOperationTotals

        val currencies = parsedTotals.keys + suggestionTotals.keys + operationTotals.keys
        val dayTotals = currencies.map {
            val parsed = parsedTotals[it] ?: emptyAmount(it)
            val suggested = suggestionTotals[it] ?: emptyAmount(it)
            val operation = operationTotals[it] ?: emptyAmount(it)
            ImportDataTotal(
                importDataDay = day,
                currency = it,
                parsed = parsed,
                suggested = suggested,
                operation = operation,
                actual = emptyAmount(it),
                valid = operation + suggested == parsed,
            )
        }

        day.totals.clear()
        day.totals.addAll(dayTotals)
        day.valid = day.totals.all { it.valid }
    }


    private fun calculateGrandTotal(importData: ImportData) {
        val existingActual = importData.totals.associateBy({ it.currency }, { it.actual })
        val balances = balanceRepository.findByAccount(importData.account)
            .associate { it.amount.currency to it.amount }

        val grandTotals = importData.days
            .flatMap { it.totals }
            .groupBy { it.currency }
            .map { (currency, dayTotals) ->
                emptyTotal(currency).also {
                    val parsed = dayTotals.fold(emptyAmount(currency)) { acc, total -> acc + total.parsed }
                    val operation = dayTotals.fold(emptyAmount(currency)) { acc, total -> acc + total.operation }
                    val suggested = dayTotals.fold(emptyAmount(currency)) { acc, total -> acc + total.suggested }
                    val balance = balances[currency] ?: emptyAmount(currency)
                    val actual = existingActual[currency] ?: emptyAmount(currency)
                    it.importData = importData
                    it.parsed = parsed
                    it.operation = operation
                    it.suggested = suggested
                    it.actual = actual
                    it.valid = operation + suggested == parsed && balance == actual
                }
            }

        importData.totals.clear()
        importData.totals.addAll(grandTotals)
    }

    private fun List<Operational>.totalByCurrency(account: Account): Map<String, Amount> = amountsForAccount(account)
        .groupingBy { it.currency }
        .aggregate { _, accumulator: Amount?, element, _ -> element + accumulator }

}
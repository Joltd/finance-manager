package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.contains
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataOperation
import com.evgenltd.financemanager.importexport.entity.ImportDataOperationType
import com.evgenltd.financemanager.importexport.entity.ImportDataTotal
import com.evgenltd.financemanager.importexport.entity.ImportDataTotalType
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataOperationRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataTotalRepository
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.operation.service.signedAmount
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.common.service.until
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.ai.service.EmbeddingActionService
import com.evgenltd.financemanager.importexport.record.OperationKey
import com.evgenltd.financemanager.importexport.record.TotalEntry
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.service.byAccount
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.io.InputStream
import java.time.LocalDate
import java.util.*

@Service
class ImportDataActionService(
    private val importDataParserResolver: ImportDataParserResolver,
    private val importDataRepository: ImportDataRepository,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val importDataOperationRepository: ImportDataOperationRepository,
    private val importDataTotalRepository: ImportDataTotalRepository,
    private val embeddingActionService: EmbeddingActionService,
    private val operationRepository: OperationRepository,
    private val accountRepository: AccountRepository,
    private val transactionRepository: TransactionRepository,
) : Loggable() {

    @Transactional
    fun parseImportData(id: UUID, stream: InputStream) {
        val importData = importDataRepository.find(id)
        importDataParserResolver.resolve(importData.account.parser)
                .parse(importData, stream)
                .map { saveParsedEntry(it, importData) }
    }

    private fun saveParsedEntry(entry: ImportDataParsedEntry, importData: ImportData): ImportDataOperation {
        val importDataEntry = importDataEntryRepository.save(ImportDataEntry(importData = importData, date = entry.date, visible = true))
        return ImportDataOperation(
            importDataEntry = importDataEntry,
            importType = ImportDataOperationType.PARSED,
            date = entry.date,
            type = entry.type,
            amountFrom = entry.amountFrom,
            accountFrom = entry.accountFrom ?: (if (entry.type == OperationType.EXPENSE) importData.account else null),
            amountTo = entry.amountTo,
            accountTo = entry.accountTo ?: (if (entry.type == OperationType.INCOME) importData.account else null),
            description = entry.description,
            raw = entry.rawEntries,
            hintInput = entry.hint,
        ).also { importDataOperationRepository.save(it) }
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
        val importData = importDataEntry.importData

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
                    accountFrom = if (parsed.type == OperationType.INCOME) account else importData.account,
                    amountTo = parsed.amountTo,
                    accountTo = if (parsed.type == OperationType.EXPENSE) account else importData.account,
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
    fun linkExistedOperations(id: UUID) {
        val importData = importDataRepository.find(id)
        val range = importDataEntryRepository.findImportDataDateRange(importData) ?: return

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

        ((ImportDataEntry::importData eq importData) and (ImportDataEntry::date between range))
            .let { importDataEntryRepository.findAll(it) }
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
        val totals = importDataTotalRepository.findByImportDataAndDateIsNullAndType(importData, ImportDataTotalType.ACTUAL)
        val total = totals.firstOrNull { it.amount.currency == balance.currency }
        if (total != null) {
            total.amount = balance
            return
        }

        ImportDataTotal(importData = importData, type = ImportDataTotalType.ACTUAL, amount = balance)
            .let { importDataTotalRepository.save(it) }
    }

    @Transactional
    fun linkOperation(id: UUID, entryId: UUID, operationId: UUID): List<LocalDate> {
        val importData = importDataRepository.find(id)
        val entry = importDataEntryRepository.find(entryId)

        val alreadyLinked = importDataEntryRepository.existsByImportDataAndOperationId(importData, operationId)
        if (alreadyLinked) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Operation already linked to another entry")
        }

        val operation = operationRepository.find(operationId)

//        if (entry.date != operation.date) {
//            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Operation date does not match entry date")
//        }

        linkOperation(entry, operation)

        return listOf(operation.date, entry.date)
    }

    private fun linkOperation(entry: ImportDataEntry, operation: Operation) {
        entry.operation = operation

        entry.parsed()?.let {
            operation.raw = it.raw
            operation.hint = it.hint
        }
    }

    @Transactional
    fun unlinkOperation(id: UUID, entryIds: List<UUID>): List<LocalDate> =
        importDataEntryRepository.findAllById(entryIds)
            .onEach {
                it.operation?.raw = emptyList()
                it.operation?.hint = null
                it.operation = null
            }
            .map { it.date }
            .distinct()

    @Transactional
    fun entryVisible(id: UUID, operationIds: List<UUID>, entryIds: List<UUID>, visible: Boolean): List<LocalDate> {
        val importData = importDataRepository.find(id)

        val affectedEntryDates = importDataEntryRepository.findByIdInAndVisible(entryIds, !visible)
            .onEach { it.visible = visible }
            .map { it.date }

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
    fun calculateTotal(id: UUID, dates: List<LocalDate>? = null) {
        val importData = importDataRepository.find(id)

        if (dates == null) {
            importDataTotalRepository.deleteByImportData(importData)
        } else {
            importDataTotalRepository.deleteByImportDataAndDateIn(importData, dates)
            importDataTotalRepository.deleteByImportDataAndDateIsNull(importData)
        }

        val entries = ((ImportDataEntry::importData eq importData) and
                (ImportDataEntry::date contains dates))
            .let { importDataEntryRepository.findAll(it) }

        entries
            .filter { it.visible }
            .mapNotNull { it.parsed() }
            .toTotalEntries(importData.account)
            .calculateTotal(importData, ImportDataTotalType.PARSED)

        entries
            .filter { it.visible }
            .filter { it.operation == null }
            .flatMap { it.suggested() }
            .filter { it.selected }
            .toTotalEntries(importData.account)
            .calculateTotal(importData, ImportDataTotalType.SUGGESTED)

        val hiddenEntries = entries.filter { !it.visible }
            .mapNotNull { it.operation?.id }
            .toSet()

        val actualDates = dates ?: entries.map { it.date }.distinct()
        ((Transaction::account eq importData.account) and (Transaction::date contains actualDates))
            .let { transactionRepository.findAll(it) }
            .filter { it.operation.id !in importData.hiddenOperations }
            .filter { it.operation.id !in hiddenEntries }
            .map { TotalEntry(it.date, it.signedAmount()) }
            .calculateTotal(importData, ImportDataTotalType.OPERATION)
    }

    private fun List<ImportDataOperation>.toTotalEntries(account: Account): List<TotalEntry> = groupBy { it.date }
        .flatMap { (date, operations) ->
            operations.asSequence()
                .amountsForAccount(account)
                .map {
                    TotalEntry(
                        date = date,
                        amount = it
                    )
                }
        }

    private fun List<TotalEntry>.calculateTotal(importData: ImportData, type: ImportDataTotalType) {
        groupingBy { it.date to it.amount.currency }
            .aggregate { _, accumulator: Amount?, element, _ -> element.amount + accumulator }
            .map { (key, amount) ->
                ImportDataTotal(
                    importData = importData,
                    type = type,
                    date = key.first,
                    amount = amount,
                )
            }
            .let { importDataTotalRepository.saveAll(it) }
            .groupingBy { it.amount.currency }
            .aggregate { _, accumulator: Amount?, element, _ -> element.amount + accumulator }
            .map {
                ImportDataTotal(
                    importData = importData,
                    type = type,
                    date = null,
                    amount = it.value,
                )
            }
            .let { importDataTotalRepository.saveAll(it) }
    }

}
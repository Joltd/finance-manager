package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.ai.service.AiProviderResolver
import com.evgenltd.financemanager.common.entity.Embedding
import com.evgenltd.financemanager.common.repository.EmbeddingRepository
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.contains
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.common.util.operationEmbeddingInput
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
import com.evgenltd.financemanager.importexport.service.amountsForAccount
import com.evgenltd.financemanager.importexport.service.parsed
import com.evgenltd.financemanager.importexport2.record.ImportDataParsedEntry
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.operation.service.signedAmount
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.turnover.service.TurnoverService
import org.springframework.context.ApplicationEventPublisher
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
    private val importDataConverter: ImportDataConverter,
    private val aiProviderResolver: AiProviderResolver,
    private val embeddingRepository: EmbeddingRepository,
    private val operationRepository: OperationRepository,
    private val publisher: ApplicationEventPublisher,
    private val accountRepository: AccountRepository,
    private val importDataService: ImportDataService,
    private val turnoverService: TurnoverService,
    private val transactionRepository: TransactionRepository,
) : Loggable() {

    @Transactional
    fun parseImportData(id: UUID, stream: InputStream) {
        val importData = importDataRepository.find(id)
        val parsed = importDataParserResolver.resolve(importData.account.parser)
                .parse(importData, stream)
                .map { saveParsedEntry(it, importData) }

        calculateTotal(importData, parsed)
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
    fun linkOperation(id: UUID, entryId: UUID, operationId: UUID): Set<LocalDate> {
        val importData = importDataRepository.find(id)
        val entry = importDataEntryRepository.find(entryId)

        val alreadyLinked = importDataEntryRepository.existsByImportDataAndOperationId(importData, operationId)
        if (alreadyLinked) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Operation already linked to another entry")
        }

        val operation = operationRepository.find(operationId)

        if (entry.date != operation.date) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Operation date does not match entry date")
        }

        entry.operation = operation

        return setOf(operation.date, entry.date)
    }

    @Transactional
    fun entryVisible(id: UUID, operationIds: List<UUID>, entryIds: List<UUID>, visible: Boolean): Set<LocalDate> {
        val importData = importDataRepository.find(id)

        val affectedEntryDates = importDataEntryRepository.findByIdInAndVisible(entryIds, !visible)
            .onEach { it.visible = visible }
            .map { it.date }
            .toSet()

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
            .toSet()

        return affectedEntryDates + affectedOperationDates
    }

    @Transactional
    fun entryApprove(id: UUID, entryId: UUID): LocalDate {
        return LocalDate.now()
    }

    @Transactional
    fun calculateTotal(id: UUID, dates: Iterable<LocalDate> = emptyList()) {
        val importData = importDataRepository.find(id)

        ((ImportDataEntry::importData eq importData) and (ImportDataEntry::date contains dates) and (ImportDataEntry::visible eq true))
            .let { importDataEntryRepository.findAll(it) }
            .mapNotNull { it.parsed() }
            .let { calculateTotal(importData, it) }
    }

    private fun calculateTotal(importData: ImportData, parsed: List<ImportDataOperation>) {
        val dates = parsed.map { it.date }.toSet()

        importDataTotalRepository.deleteByImportDataAndDateIn(importData, dates)
        importDataTotalRepository.deleteByImportDataAndDateIsNull(importData)

        parsed.groupBy { it.date }
            .flatMap { (date, operations) ->
                operations.asSequence()
                    .amountsForAccount(importData.account)
                    .groupingBy { it.currency }
                    .aggregate { _, accumulator: Amount?, element, _ -> element + accumulator }
                    .map {
                        ImportDataTotal(
                            importData = importData,
                            type = ImportDataTotalType.PARSED,
                            date = date,
                            amount = it.value,
                        )
                    }
            }
            .let { importDataTotalRepository.saveAll(it) }
            .groupingBy { it.amount.currency }
            .aggregate { _, accumulator: Amount?, element, _ -> element.amount + accumulator }
            .map {
                ImportDataTotal(
                    importData = importData,
                    type = ImportDataTotalType.PARSED,
                    date = null,
                    amount = it.value,
                )
            }
            .let { importDataTotalRepository.saveAll(it) }

        ((Transaction::account eq importData.account) and (Transaction::date contains dates))
            .let { transactionRepository.findAll(it) }
            .filter { it.operation.id !in importData.hiddenOperations }
            .groupingBy { it.date to it.amount.currency }
            .aggregate { _, accumulator: Amount?, element, _ -> element.signedAmount() + accumulator }
            .map {
                ImportDataTotal(
                    importData = importData,
                    type = ImportDataTotalType.OPERATION,
                    date = it.key.first,
                    amount = it.value,
                )
            }
            .let { importDataTotalRepository.saveAll(it) }
            .groupingBy { it.amount.currency }
            .aggregate { _, accumulator: Amount?, element, _ -> element.amount + accumulator }
            .map {
                ImportDataTotal(
                    importData = importData,
                    type = ImportDataTotalType.OPERATION,
                    date = null,
                    amount = it.value,
                )
            }
            .let { importDataTotalRepository.saveAll(it) }
    }

    private fun ImportDataOperation.fullInput(): String = operationEmbeddingInput(
        date = date,
        type = type,
        amountFrom = amountFrom,
        accountFrom = accountFrom?.name,
        amountTo = amountTo,
        accountTo = accountTo?.name,
    )

}
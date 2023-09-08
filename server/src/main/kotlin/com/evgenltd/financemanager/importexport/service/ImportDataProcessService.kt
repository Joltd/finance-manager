package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.repository.*
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.importexport.entity.CategoryMapping
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataStatus
import com.evgenltd.financemanager.importexport.entity.ImportOption
import com.evgenltd.financemanager.importexport.entity.ImportResult
import com.evgenltd.financemanager.importexport.entity.SuggestedOperation
import com.evgenltd.financemanager.importexport.record.ImportDataEntryUpdateRequest
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.service.OperationService
import com.evgenltd.financemanager.reference.converter.AccountConverter
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.AccountRecord
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate
import java.io.InputStream
import java.util.*

@Service
class ImportDataProcessService(
    private val importDataRepository: ImportDataRepository,
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val importParserService: ImportParserService,
    private val categoryMappingService: CategoryMappingService,
    private val operationService: OperationService,
    private val accountConverter: AccountConverter,
    private val transactionTemplate: TransactionTemplate
) : Loggable() {

    fun entryUpdate(id: UUID, entryId: UUID, request: ImportDataEntryUpdateRequest) {
        update(id, ImportDataStatus.PREPARE_DONE) {
            it.status = ImportDataStatus.PREPARE_IN_PROGRESS
        } ?: return

        val importDataEntry = importDataEntryRepository.find(entryId)

        request.preparationResult?.let {
            importDataEntry.preparationResult = it
        }
        request.option?.let {
            importDataEntry.option = it
        }
        request.suggestedOperation?.let {
            importDataEntry.suggestedOperation = it
        }

        update(id, ImportDataStatus.PREPARE_IN_PROGRESS) {
            it.status = ImportDataStatus.PREPARE_DONE
        }
    }

    fun entryUpdateSimilar(id: UUID, entryId: UUID) {
        update(id, ImportDataStatus.PREPARE_DONE) {
            it.status = ImportDataStatus.PREPARE_IN_PROGRESS
        } ?: return

        val importDataEntry = importDataEntryRepository.find(entryId)
        try {
            searchSimilarOperations(importDataEntry)
        } catch (e: Exception) {
            importDataEntry.preparationError = "Unable to search similar operations: ${e.message ?: "Unknown error"}"
        }
        importDataEntryRepository.save(importDataEntry)

        update(id, ImportDataStatus.PREPARE_IN_PROGRESS) {
            it.status = ImportDataStatus.PREPARE_DONE
        }
    }

    @Async
    fun preparationStart(id: UUID, file: InputStream) {
        val importData = update(id, ImportDataStatus.NEW) {
            it.status = ImportDataStatus.PREPARE_IN_PROGRESS
        } ?: return

        val parser = importParserService.resolve(importData.parser)
        if (parser == null) {
            update(id, ImportDataStatus.PREPARE_IN_PROGRESS) {
                it.status = ImportDataStatus.FAILED
                it.message = "Parser ${importData.parser} not found"
            }
            return
        }

        val categoryMappings = categoryMappingService.findByParser(importData.parser)

        val parsedEntries = try {
            parser.parse(file)
        } catch (e: RuntimeException) {
            update(id, ImportDataStatus.PREPARE_IN_PROGRESS) {
                it.status = ImportDataStatus.FAILED
                it.message = "Unable to parse: ${e.message ?: "Unknown error"}"
            }
            return
        }

        var work = 0
        for (parsedEntry in parsedEntries) {
            val actualImportData = update(id, ImportDataStatus.PREPARE_IN_PROGRESS) {
                it.progress = ++work / parsedEntries.size.toDouble()
            } ?: return
            val importDataEntry = ImportDataEntry(
                importData = actualImportData,
                parsedEntry = parsedEntry
            )
            importDataEntryRepository.save(importDataEntry)
            prepareEntry(importDataEntry, importData, categoryMappings)
        }

        update(id, ImportDataStatus.PREPARE_IN_PROGRESS) {
            it.status = ImportDataStatus.PREPARE_DONE
            it.progress = 1.0
        }
    }

    fun preparationRepeat(id: UUID) {
        val importData = update(id, listOf(ImportDataStatus.PREPARE_DONE)) {
            it.status = ImportDataStatus.PREPARE_IN_PROGRESS
            it.message = null
            it.progress = .0
        } ?: return

        val categoryMappings = categoryMappingService.findByParser(importData.parser)

        var pageIndex = 0
        var work = 0
        while (true) {
            val page = importDataEntryRepository.findAllByCondition(pageIndex, 20) {
                (ImportDataEntry.Companion::importDataId eq id) and (ImportDataEntry.Companion::preparationResult eq false)
            }
            if (++pageIndex >= page.totalPages) {
                break
            }

            for (importDataEntry in page.content) {
                update(id, ImportDataStatus.PREPARE_IN_PROGRESS) {
                    it.progress = ++work / page.content.size.toDouble()
                } ?: return

                importDataEntry.preparationError = null
                importDataEntry.suggestedOperation = null
                importDataEntry.matchedCategoryMappings = emptyList()
                importDataEntry.similarOperations = emptyList()

                prepareEntry(importDataEntry, importData, categoryMappings)
            }
        }

        update(id, ImportDataStatus.PREPARE_IN_PROGRESS) {
            it.status = ImportDataStatus.PREPARE_DONE
            it.progress = 1.0
        }
    }

    fun preparationRepeat(id: UUID, entryId: UUID) {
        val importData = update(id, ImportDataStatus.PREPARE_DONE) {
            it.status = ImportDataStatus.PREPARE_IN_PROGRESS
        } ?: return

        val categoryMappings = categoryMappingService.findByParser(importData.parser)
        val importDataEntry = importDataEntryRepository.find(entryId)
        prepareEntry(importDataEntry, importData, categoryMappings)

        update(id, ImportDataStatus.PREPARE_IN_PROGRESS) {
            it.status = ImportDataStatus.PREPARE_DONE
        }
    }

    fun preparationCancel(id: UUID) {
        update(id, ImportDataStatus.PREPARE_IN_PROGRESS) {
            it.status = ImportDataStatus.PREPARE_DONE
            it.progress = 1.0
        }
    }

    @Async
    fun importStart(id: UUID) {
        update(id, ImportDataStatus.PREPARE_DONE) {
            it.status = ImportDataStatus.IMPORT_IN_PROGRESS
            it.progress = .0
        } ?: return

        var pageIndex = 0
        var work = 0
        while (true) {
            val page = importDataEntryRepository.findAllByCondition(pageIndex, 20) {
                (ImportDataEntry.Companion::importDataId eq id) and
                (ImportDataEntry.Companion::preparationResult eq true) and
                (ImportDataEntry.Companion::option inList listOf(ImportOption.REPLACE, ImportOption.CREATE_NEW)) and
                (ImportDataEntry.Companion::importResult eq ImportResult.NOT_IMPORTED)
            }

            if (++pageIndex >= page.totalPages) {
                break
            }

            for (importDataEntry in page.content) {
                update(id, ImportDataStatus.PREPARE_IN_PROGRESS) {
                    it.progress = ++work / page.content.size.toDouble()
                } ?: return

                importEntry(importDataEntry)
                importDataEntryRepository.save(importDataEntry)
            }
        }

        update(id, ImportDataStatus.IMPORT_IN_PROGRESS) {
            it.status = ImportDataStatus.IMPORT_DONE
            it.progress = 1.0
        }
    }

    fun importCancel(id: UUID) {
        update(id, ImportDataStatus.IMPORT_IN_PROGRESS) {
            it.status = ImportDataStatus.IMPORT_DONE
            it.progress = 1.0
        }
    }

    //

    private fun prepareEntry(
        importDataEntry: ImportDataEntry,
        importData: ImportData,
        categoryMappings: List<Pair<Regex, CategoryMapping>>
    ) {
        try {
            suggestOperation(importDataEntry, importData, categoryMappings)
            if (importDataEntry.preparationResult) {
                val similarOperations = searchSimilarOperations(importDataEntry)
                decideImportOption(importDataEntry, similarOperations)
            }
        } catch (e: RuntimeException) {
            importDataEntry.preparationResult = false
            importDataEntry.preparationError = "Unable to prepare entry: ${e.message ?: "Unknown error"}"
        }
        importDataEntryRepository.save(importDataEntry)
    }

    private fun suggestOperation(
        importDataEntry: ImportDataEntry,
        importData: ImportData,
        categoryMappings: List<Pair<Regex, CategoryMapping>>
    ) {
        val parsedEntry = importDataEntry.parsedEntry
        val accountFrom = parsedEntry.accountFrom
        val accountTo = parsedEntry.accountTo
        if (accountFrom != null && accountTo != null) {
            importDataEntry.suggestedOperation = OperationRecord(
                id = null,
                date = parsedEntry.date,
                type = parsedEntry.type,
                amountFrom = parsedEntry.amountFrom,
                accountFrom = accountFrom,
                amountTo = parsedEntry.amountTo,
                accountTo = accountTo,
                description = parsedEntry.description
            )
            return
        }

        importDataEntry.matchedCategoryMappings = categoryMappings.filter { it.first.matches(parsedEntry.description) }
            .map { it.second }
        if (importDataEntry.matchedCategoryMappings.isEmpty()) {
            importDataEntry.preparationError = "No matched categories found"
            importDataEntry.preparationResult = false
            return
        }

        if (importDataEntry.matchedCategoryMappings.size > 1) {
            importDataEntry.preparationError = "More than one category matched"
            importDataEntry.preparationResult = false
            return
        }

        val categoryMapping = importDataEntry.matchedCategoryMappings.first()
        if (categoryMapping.category.type == AccountType.EXPENSE) {
            importDataEntry.suggestedOperation = OperationRecord(
                id = null,
                date = parsedEntry.date,
                type = parsedEntry.type,
                amountFrom = parsedEntry.amountFrom,
                accountFrom = accountConverter.toRecord(importData.account),
                amountTo = parsedEntry.amountTo,
                accountTo = accountConverter.toRecord(categoryMapping.category),
                description = parsedEntry.description
            )
            importDataEntry.preparationResult = true
            return
        }

        if (categoryMapping.category.type == AccountType.INCOME) {
            importDataEntry.suggestedOperation = OperationRecord(
                id = null,
                date = parsedEntry.date,
                type = parsedEntry.type,
                amountFrom = parsedEntry.amountFrom,
                accountFrom = accountConverter.toRecord(categoryMapping.category),
                amountTo = parsedEntry.amountTo,
                accountTo = accountConverter.toRecord(importData.account),
                description = parsedEntry.description
            )
            importDataEntry.preparationResult = true
            return
        }

        importDataEntry.preparationResult = false
        importDataEntry.preparationError = "Mapped category is not suitable"
    }

    private fun searchSimilarOperations(importDataEntry: ImportDataEntry): List<Operation> {
        val suggestedOperation = importDataEntry.suggestedOperation ?: return emptyList()
        val similarOperations = operationService.findSimilar(suggestedOperation)
        importDataEntry.similarOperations = similarOperations.map { it.id!! }
        return similarOperations
    }

    private fun decideImportOption(importDataEntry: ImportDataEntry, similarOperations: List<Operation>) {
        val suggestedOperation = importDataEntry.suggestedOperation ?: return

        if (similarOperations.isEmpty()) {
            importDataEntry.option = ImportOption.CREATE_NEW
            return
        }

        if (similarOperations.size > 1) {
            return
        }

        val similarOperation = similarOperations.first()
        val operationIsEqual = similarOperation.date == suggestedOperation.date
                && similarOperation.type == suggestedOperation.type
                && similarOperation.accountFrom.id == suggestedOperation.accountFrom.id
                && similarOperation.accountTo.id == suggestedOperation.accountTo.id
                && similarOperation.amountFrom == suggestedOperation.amountFrom
                && similarOperation.amountTo == suggestedOperation.amountFrom
        if (operationIsEqual) {
            importDataEntry.option = ImportOption.SKIP
        } else {
            importDataEntry.option = ImportOption.REPLACE
        }
    }

    private fun importEntry(importDataEntry: ImportDataEntry) {
        val suggestedOperation = importDataEntry.suggestedOperation
        if (suggestedOperation == null) {
            importDataEntry.importResult = ImportResult.FAILED
            importDataEntry.importError = "Suggested operation is null"
            return
        }

        if (importDataEntry.option == ImportOption.REPLACE) {
            if (importDataEntry.similarOperations.size > 1) {
                importDataEntry.importResult = ImportResult.FAILED
                importDataEntry.importError = "More than one similar operation found"
                return
            }

            importDataEntry.similarOperations.firstOrNull()?.let {
                operationService.delete(it)
            }
        }

        val operationRecord = OperationRecord(
            id = null,
            date = suggestedOperation.date,
            type = suggestedOperation.type,
            amountFrom = suggestedOperation.amountFrom,
            accountFrom = suggestedOperation.accountFrom,
            amountTo = suggestedOperation.amountTo,
            accountTo = suggestedOperation.accountTo,
            description = suggestedOperation.description
        )
        operationService.update(operationRecord)

        importDataEntry.importResult = ImportResult.DONE
    }

    //

    private fun update(id: UUID, expectedStatus: ImportDataStatus, block: (ImportData) -> Unit = {}): ImportData? =
        update(id, listOf(expectedStatus), block)

    private fun update(id: UUID, expectedStatuses: List<ImportDataStatus>, block: (ImportData) -> Unit = {}): ImportData? {
        return transactionTemplate.execute {
            val importData = importDataRepository.findAndLock(id)
            if (importData == null) {
                log.warn("Import data [$id] not found")
                return@execute null
            }

            if (importData.status !in expectedStatuses) {
                log.warn("Import data [${importData.id}] has unexpected status [${importData.status}]")
                return@execute null
            }

            block(importData)

            importData
        }
    }

}
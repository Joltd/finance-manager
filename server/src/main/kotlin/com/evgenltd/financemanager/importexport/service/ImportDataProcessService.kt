package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.document.entity.Document
import com.evgenltd.financemanager.document.entity.DocumentExchange
import com.evgenltd.financemanager.document.entity.DocumentExpense
import com.evgenltd.financemanager.document.entity.DocumentIncome
import com.evgenltd.financemanager.document.service.DocumentService
import com.evgenltd.financemanager.importexport.entity.*
import com.evgenltd.financemanager.importexport.repository.CategoryMappingRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.service.parser.ImportParser
import org.springframework.data.domain.PageRequest
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.*
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import java.io.InputStream
import java.math.BigDecimal
import javax.annotation.PostConstruct

@Service
class ImportDataProcessService(
    private val importDataEntryRepository: ImportDataEntryRepository,
    private val categoryMappingRepository: CategoryMappingRepository,
    private val documentService: DocumentService,
    private val importParsers: List<ImportParser>,
    private val mongoTemplate: MongoTemplate
) : Loggable() {

    private lateinit var parsers: Map<String,ImportParser>

    @PostConstruct
    fun postConstruct() {
        parsers = importParsers.associateBy { it.id }
    }

    @Async
    fun startPreparation(file: InputStream, id: String) {
        val importData = update(id, ImportDataStatus.NEW, ImportDataStatus.PREPARE_IN_PROGRESS)
        if (importData == null) {
            log.info("Import data $id not found or status is different from ${ImportDataStatus.NEW}")
            return
        }

        val parser = parsers[importData.parser]
        if (parser == null) {
            update(id, ImportDataStatus.PREPARE_IN_PROGRESS, ImportDataStatus.FAILED) {
                mapOf(ImportData::message.name to "Parser ${importData.parser} not found")
            }
            return
        }

        val categoryMappings = categoryMappingRepository.findByParser(importData.parser)
            .map { Regex(it.pattern) to it }

        val parsed = try {
            parser.parse(file)
        } catch (e: RuntimeException) {
            update(id, ImportDataStatus.PREPARE_IN_PROGRESS, ImportDataStatus.FAILED) {
                mapOf(ImportData::message.name to "Unable to parse: ${e.message ?: "Unknown error"}")
            }
            return
        }

        for (parsedRecord in parsed) {
            val importData = update(id, ImportDataStatus.PREPARE_IN_PROGRESS)
            if (importData == null) {
                log.info("Import data $id not found or status is different from ${ImportDataStatus.PREPARE_IN_PROGRESS}")
                break
            }

            val importDataEntry = ImportDataEntry(importData = id, parsedEntry = parsedRecord)
            prepareImportEntry(importDataEntry, importData, categoryMappings)
        }

        update(id, ImportDataStatus.PREPARE_IN_PROGRESS, ImportDataStatus.PREPARE_DONE)
    }

    @Async
    fun repeatPreparation(id: String) {
        val importData = update(id, ImportDataStatus.PREPARE_DONE, ImportDataStatus.PREPARE_IN_PROGRESS) {
            mapOf(
                ImportData::message.name to null,
                ImportData::progress.name to 0.0
            )
        }
        if (importData == null) {
            log.info("Import data $id not found or status is different from ${ImportDataStatus.NEW}")
            return
        }

        val categoryMappings = categoryMappingRepository.findByParser(importData.parser)
            .map { Regex(it.pattern) to it }

        Query().addCriteria(Criteria().andOperator(
            Criteria.where(ImportDataEntry::importData.name).isEqualTo(id),
            Criteria.where(ImportDataEntry::preparationResult.name).isEqualTo(false)
        )).findBatched<ImportDataEntry> { entry, _, _ ->
            val importData = update(id, ImportDataStatus.PREPARE_IN_PROGRESS)
            if (importData == null) {
                log.info("Import data $id not found or status is different from ${ImportDataStatus.PREPARE_IN_PROGRESS}")
                false
            } else {
                entry.preparationError = null
                entry.preparationResult = false
                entry.suggestedDocument = null
                entry.matchedCategoryMappings = emptyList()
                entry.existedDocuments = emptyList()
                prepareImportEntry(entry, importData, categoryMappings)
                true
            }
        }

        update(id, ImportDataStatus.PREPARE_IN_PROGRESS, ImportDataStatus.PREPARE_DONE)
    }

    fun cancelPreparation(id: String) {
        update(id, ImportDataStatus.PREPARE_IN_PROGRESS, ImportDataStatus.PREPARE_DONE)
    }

    @Async
    fun startImport(id: String) {
        val importData = update(id, ImportDataStatus.PREPARE_DONE, ImportDataStatus.IMPORT_IN_PROGRESS)
        if (importData == null) {
            log.info("Import data $id not found or status is different from ${ImportDataStatus.PREPARE_DONE}")
            return
        }

        val empty = Query().addCriteria(Criteria().andOperator(
            Criteria.where(ImportDataEntry::importData.name).isEqualTo(id),
            Criteria.where(ImportDataEntry::preparationResult.name).isEqualTo(true),
            Criteria.where(ImportDataEntry::option.name).inValues(ImportOption.REPLACE, ImportOption.CREATE_NEW),
            Criteria.where(ImportDataEntry::importResult.name).isEqualTo(ImportResult.NOT_IMPORTED)
        )).findBatched<ImportDataEntry> { entry, index, count ->
            val importData = update(id, ImportDataStatus.IMPORT_IN_PROGRESS) {
                mapOf(ImportData::progress.name to (index.toDouble() / count.toDouble()))
            }
            if (importData == null) {
                log.info("Import data $id not found or status is different from ${ImportDataStatus.IMPORT_IN_PROGRESS}")
                false
            } else {
                doImportEntry(entry)
                true
            }

        }

        if (empty) {
            update(id, ImportDataStatus.IMPORT_IN_PROGRESS, ImportDataStatus.IMPORT_DONE) {
                mapOf(ImportData::message.name to "Nothing to import")
            }
            return
        }

        update(id, ImportDataStatus.IMPORT_IN_PROGRESS, ImportDataStatus.IMPORT_DONE)
    }

    fun cancelImport(id: String) {
        
    }

    private fun doImportEntry(entry: ImportDataEntry) {
        val suggestedDocument = entry.suggestedDocument
        if (suggestedDocument == null) {
            entry.importError = "There is no suggested document"
            entry.importResult = ImportResult.FAILED
            return
        }

        if (entry.option == ImportOption.REPLACE) {
            if (entry.existedDocuments.size > 1) {
                entry.importError = "Too many documents for replace"
                entry.importResult = ImportResult.FAILED
                return
            }

            entry.existedDocuments.firstOrNull()?.let { documentService.delete(it) }
        }

        documentService.update(suggestedDocument)
        entry.importResult = ImportResult.DONE
        importDataEntryRepository.save(entry)
    }

    private fun prepareImportEntry(
        importDataEntry: ImportDataEntry,
        importData: ImportData,
        categoryMappings: List<Pair<Regex, CategoryMapping>>
    ) {
        try {
            importDataEntry
                .suggestDocument(importData, categoryMappings)
                .searchMatchedDocuments(importData)
        } catch (e: RuntimeException) {
            importDataEntry.preparationError = "Unable to fill: ${e.message ?: "Unknown error"}"
        }
        importDataEntryRepository.save(importDataEntry)
    }

    private fun ImportDataEntry.suggestDocument(importData: ImportData, categoryMappings: List<Pair<Regex,CategoryMapping>>): ImportDataEntry {
        if (parsedEntry.type == EXCHANGE_TYPE) {
            val amountFrom = parsedEntry.amountFrom
            val amountTo = parsedEntry.amountTo
            if (amountFrom == null || amountTo == null) {
                preparationError = "For exchange both amountFrom and amountTo must be specified"
                return this
            }

            suggestedDocument = DocumentExchange(
                id = null,
                date = parsedEntry.date,
                description = parsedEntry.description,
                accountFrom = importData.account,
                amountFrom = amountFrom,
                accountTo = importData.account,
                amountTo = amountTo
            )

            return this
        }

        val amount = parsedEntry.amount
        if (amount == null) {
            preparationError = "For non-exchange amount should be specified"
            return this
        }

        val matchedCategoryMappings = categoryMappings.filter { it.first.matches(parsedEntry.description) }
        this.matchedCategoryMappings = matchedCategoryMappings.map { it.second }
        if (matchedCategoryMappings.size > 1) {
            this.preparationError = "Too many matched categories"
            return this
        }

        if (matchedCategoryMappings.isEmpty()) {
            preparationError = "No matched categories"
            return this
        }

        val matchedCategoryMapping = matchedCategoryMappings.first()
        when (matchedCategoryMapping.second.categoryType) {
            EXPENSE_TYPE -> suggestedDocument = DocumentExpense(
                id = null,
                date = parsedEntry.date,
                description = parsedEntry.description,
                account = importData.account,
                amount = amount,
                expenseCategory = matchedCategoryMapping.second.category
            )
            INCOME_TYPE -> suggestedDocument = DocumentIncome(
                id = null,
                date = parsedEntry.date,
                description = parsedEntry.description,
                account = importData.account,
                amount = amount,
                incomeCategory = matchedCategoryMapping.second.category
            )
            else -> {
                preparationError = "Unknown category type ${matchedCategoryMapping.second.categoryType}"
                return this
            }
        }

        preparationResult = true
        return this
    }

    private fun ImportDataEntry.searchMatchedDocuments(importData: ImportData) {
        if (!preparationResult) {
            return
        }

        val suggestedDocument = this.suggestedDocument ?: return

        val existedDocumentList = documentService.findDocumentByAccountAndDate(importData.account, suggestedDocument.date)
            .filter { it.approximatelySame(suggestedDocument) }
        existedDocuments = existedDocumentList.map { it.id!! }

        decideImportOption(existedDocumentList)
    }

    private fun ImportDataEntry.decideImportOption(existedDocuments: List<Document>) {
        val suggestedDocument = this.suggestedDocument ?: return
        if (existedDocuments.isEmpty()) {
            option = ImportOption.CREATE_NEW
            return
        }
        if (existedDocuments.size > 1) {
            return
        }
        val existedDocument = existedDocuments.first()
        if (existedDocument.matches(suggestedDocument)) {
            option = ImportOption.SKIP
            return
        }
        option = ImportOption.REPLACE
    }

    private fun Document.approximatelySame(that: Document): Boolean =
        if (that is DocumentExpense && this is DocumentExpense) {
            that.amount.approximatelySame(amount)
        } else if (that is DocumentIncome && this is DocumentIncome) {
            that.amount.approximatelySame(amount)
        } else if (that is DocumentExchange && this is DocumentExchange) {
            that.amountFrom.approximatelySame(amountFrom)
                    && that.amountTo.approximatelySame(amountTo)
        } else {
            false
        }

    private fun Amount.approximatelySame(amount: Amount): Boolean =
        currency == amount.currency
                && BigDecimal(value - amount.value).abs() < BigDecimal(value).multiply(BigDecimal("0.1"))

    private fun Document.matches(that: Document): Boolean =
        if (that is DocumentExpense && this is DocumentExpense) {
            that.amount == amount
                    && that.expenseCategory == expenseCategory
        } else if (that is DocumentIncome && this is DocumentIncome) {
            that.amount == amount
                    && that.incomeCategory == incomeCategory
        } else if (that is DocumentExchange && this is DocumentExchange) {
            that.amountFrom == amountFrom
                    && that.amountTo == amountTo
                    && that.accountFrom == accountFrom
                    && that.accountTo == accountTo
        } else {
            false
        }

    private inline fun <reified T> Query.findBatched(block: (T,Int,Int) -> Boolean): Boolean {
        val count = mongoTemplate.count(this, T::class.java).toInt()
        if (count == 0) {
            return true
        }

        val totalPages = count / IMPORT_DATA_ENTRY_BATCH_SIZE + 1
        for (pageIndex in 0 until totalPages) {

            val query = this.with(PageRequest.of(pageIndex, IMPORT_DATA_ENTRY_BATCH_SIZE))
            val entries = mongoTemplate.find(query, T::class.java)

            for ((entryIndex, entry) in entries.withIndex()) {
                val index = pageIndex + IMPORT_DATA_ENTRY_BATCH_SIZE + entryIndex
                val continueRead = block(entry, index, count)
                if (!continueRead) {
                    return false
                }
            }

        }

        return false
    }

    private fun update(
        id: String,
        oldStatus: ImportDataStatus,
        newStatus: ImportDataStatus,
        block: () -> Map<String,Any?> = { emptyMap() }
    ): ImportData? = update(id, oldStatus) {
        mapOf(ImportData::status.name to newStatus) + block()
    }

    private fun update(
        id: String,
        statusCondition: ImportDataStatus,
        block: () -> Map<String,Any?> = { emptyMap() }
    ): ImportData? {
        val query = mapOf(ImportData::id.name to id, ImportData::status.name to statusCondition)
            .let { Criteria.byExample(it) }
            .let { Query.query(it) }
        val update = block()
            .let { org.bson.Document(it) }
            .let { Update.fromDocument(it) }
        return mongoTemplate.findAndModify(
            query,
            update,
            ImportData::class.java
        )
    }

    private companion object {
        const val EXPENSE_TYPE = "expense"
        const val INCOME_TYPE = "income"
        const val EXCHANGE_TYPE = "exchange"
        const val IMPORT_DATA_ENTRY_BATCH_SIZE = 50
    }

}
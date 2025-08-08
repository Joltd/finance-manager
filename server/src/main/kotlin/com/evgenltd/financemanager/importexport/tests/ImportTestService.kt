package com.evgenltd.financemanager.importexport.tests

import com.evgenltd.financemanager.ai.service.AiProviderResolver
import com.evgenltd.financemanager.importexport.service.CategoryMappingService
import com.evgenltd.financemanager.importexport.service.parser.TinkoffImportParser
import com.evgenltd.financemanager.operation.converter.OperationConverter
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.repository.AccountRepository
import java.util.*

//@Service
class ImportTestService(
    private val accountRepository: AccountRepository,
    private val operationRepository: OperationRepository,
    private val tinkoffImportParser: TinkoffImportParser,
    private val accountConverter: AccountConverter,
    private val categoryMappingService: CategoryMappingService,
    private val aiProviderService: AiProviderResolver,
    private val operationConverter: OperationConverter,
) {
//
//    @PostConstruct
//    fun testEmbeddingSearchWithOldData() {                                                     //       <-> eucl        <#> cos
////        val operationId = "5316312e-e7d4-4b55-a280-a6a654eccf4d" // Фастфуд|DuPain                    0.665 - 0.801   -0.778 - -0.679
////        val operationId = "2df07508-eb01-499a-9036-551d5f1bc86d" // Рестораны|Traveler's Coffee       0.6397 - 0.847  -0.7953 - -0.6404
////        val operationId = "08f62039-3c4d-427b-b62d-10897315677d" // Фастфуд|CupStore                  0.6235 - 0.787  -0.805 - -0.689
////        val operationId = "87c4ca20-5bd3-4324-9258-abc9ce5da6b0" // Аптеки|Кит-фарма                  0.97 - 1.0095   -0.525 - -0.490
//        val operationId = "a8504dae-79b6-4f61-8fbf-26e0d6498e96" // Дом и ремонт|МаксидоМ             0.76 - 1.041      -0.7077 - -0.4575
//
//        val operation = operationRepository.find(UUID.fromString(operationId))
//        val embedding = operation.embedding!!.joinToString(prefix = "[", postfix = "]")
//
//        operationRepository.findByEmbeddingExclude(embedding, operation.id!!)
//            .onEach { println("${it.id} - ${it.account} - ${it.description} - ${it.similarity}") }
//    }
//
//    fun testEmbeddingSearchWithNewData() {
//        val account = accountRepository.find(UUID.fromString(T_BANK))
//
//        val importData = ImportData(
//            parser = tinkoffImportParser.id,
//            account = account,
//            status = ImportDataStatus.NEW,
//            progress = 0.0
//        )
//        val file = File("C:\\Users\\lebed\\Downloads\\tinkoff-may.csv")
//
//        val parsed = tinkoffImportParser.parse(importData, file.inputStream())
//
//        val hint = parsed[2].hint!!
//
//        val aiProvider = aiProviderService.resolve()
//        val embeddings = aiProvider.embedding(listOf(hint))
//        val embedding = embeddings.first().joinToString(prefix = "[", postfix = "]")
//        operationRepository.findByEmbedding(embedding)
//            .onEach { println("${it.id} - ${it.account} - ${it.similarity}") }
//
//
//    }
//
//    fun testImportWithEmbeddings() {
//
//        val account = accountRepository.find(UUID.fromString(T_BANK))
//
//        val importData = ImportData(
//            parser = tinkoffImportParser.id,
//            account = account,
//            status = ImportDataStatus.NEW,
//            progress = 0.0
//        )
//        val file = File("C:\\Users\\lebed\\Downloads\\tinkoff-april.csv")
//
//        val categoryMappings = categoryMappingService.findByParser(importData.parser)
//
//        val importDataEntry = tinkoffImportParser.parse(importData, file.inputStream())
//            .map { ImportDataEntry(date = it.date, importData = importData, parsedEntry = it) }
//            .onEach { suggestOperation(it, importData, categoryMappings) }
//
//        val readyEntry = importDataEntry.filter { !it.parsedEntry.hint.isNullOrBlank() && it.suggestedOperation != null }
//
//        val hints = readyEntry.map { it.parsedEntry.hint!! }
//
//        val aiProvider = aiProviderService.resolve()
//        aiProvider.embedding(hints)
//            .onEachIndexed { index, it ->
//                val record = readyEntry[index].suggestedOperation!!
//                val operation = operationConverter.toEntity(record)
//                operation.embedding = it
//                operationRepository.save(operation)
//            }
//
//    }
//
//    private fun suggestOperation(
//        importDataEntry: ImportDataEntry,
//        importData: ImportData,
//        categoryMappings: List<Pair<Regex, CategoryMapping>>
//    ) {
//        val parsedEntry = importDataEntry.parsedEntry
//        val accountFrom = parsedEntry.accountFrom
//        val accountTo = parsedEntry.accountTo
//        if (accountFrom != null && accountTo != null) {
//            importDataEntry.suggestedOperation = OperationRecord(
//                id = null,
//                date = parsedEntry.date,
//                type = parsedEntry.type,
//                amountFrom = parsedEntry.amountFrom,
//                accountFrom = accountFrom,
//                amountTo = parsedEntry.amountTo,
//                accountTo = accountTo,
//                description = parsedEntry.description
//            )
//            importDataEntry.preparationResult = true
//            return
//        }
//
//        importDataEntry.matchedCategoryMappings = categoryMappings.filter { it.first.matches(parsedEntry.description) }
//            .map { it.second }
//        if (importDataEntry.matchedCategoryMappings.isEmpty()) {
//            importDataEntry.preparationError = "No matched categories found"
//            importDataEntry.preparationResult = false
//            return
//        }
//
//        if (importDataEntry.matchedCategoryMappings.size > 1) {
//            importDataEntry.preparationError = "More than one category matched"
//            importDataEntry.preparationResult = false
//            return
//        }
//
//        val categoryMapping = importDataEntry.matchedCategoryMappings.first()
//        if (categoryMapping.category.type == AccountType.EXPENSE) {
//            importDataEntry.suggestedOperation = OperationRecord(
//                id = null,
//                date = parsedEntry.date,
//                type = parsedEntry.type,
//                amountFrom = parsedEntry.amountFrom,
//                accountFrom = accountConverter.toRecord(importData.account),
//                amountTo = parsedEntry.amountTo,
//                accountTo = accountConverter.toRecord(categoryMapping.category),
//                description = parsedEntry.description
//            )
//            importDataEntry.preparationResult = true
//            return
//        }
//
//        if (categoryMapping.category.type == AccountType.INCOME) {
//            importDataEntry.suggestedOperation = OperationRecord(
//                id = null,
//                date = parsedEntry.date,
//                type = parsedEntry.type,
//                amountFrom = parsedEntry.amountFrom,
//                accountFrom = accountConverter.toRecord(categoryMapping.category),
//                amountTo = parsedEntry.amountTo,
//                accountTo = accountConverter.toRecord(importData.account),
//                description = parsedEntry.description
//            )
//            importDataEntry.preparationResult = true
//            return
//        }
//
//        importDataEntry.preparationResult = false
//        importDataEntry.preparationError = "Mapped category is not suitable"
//    }
//
//    private companion object {
//        const val T_BANK = "c51c4108-9f59-41aa-b2a3-c959b98234af"
//    }

}

interface TestResult {
    val id: UUID
    val account: String
    val description: String
    val similarity: Double?
}
package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.common.util.parseAmount
import com.evgenltd.financemanager.importexport.entity.CategoryMapping
import com.evgenltd.financemanager.importexport.entity.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.repository.CategoryMappingRepository
import com.evgenltd.financemanager.importexport.service.ImportParserService
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.reference.converter.AccountConverter
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.AccountRecord
import com.evgenltd.financemanager.reference.service.AccountService
import jakarta.annotation.PostConstruct
import org.springframework.stereotype.Service
import java.io.File
import java.io.InputStream
import java.util.UUID

@Service
class FinanceManagerV1ImportParser(
    private val categoryMappingRepository: CategoryMappingRepository,
    private val accountService: AccountService,
    private val accountConverter: AccountConverter,
    private val tbcImportParser: TbcImportParser,
    private val bccImportParser: BccImportParser,
    private val tinkoffImportParser: TinkoffImportParser,
    private val sberImportParser: SberImportParser
) : ImportParser, Loggable() {

    override val id: UUID = UUID.fromString("f51b0bd4-8fbd-45c8-8709-12266a846b17")
    override val name: String = "Finance Manager v1.x"

    @PostConstruct
    fun postConstruct() {
        if (categoryMappingRepository.count() > 0) {
            return
        }

        importRule("bcc", bccImportParser.id)
        importRule("sber", sberImportParser.id)
        importRule("tbc", tbcImportParser.id)
        importRule("tinkoff-rub", tinkoffImportParser.id)
    }

    override fun parse(stream: InputStream): List<ImportDataParsedEntry> {

        val accountIndex = accountService.list()
            .associateBy { it.name }
            .toMutableMap()

        return stream.readCsv()
            .map {
                log.info("Parse $it")
                when (it["type"]) {
                    "expense" -> {
                        val amount = it["amount"].parseAmount()
                        ImportDataParsedEntry(
                            rawEntries = listOf(it.toString()),
                            date = it["date"].date("yyyy-MM-dd"),
                            type = OperationType.EXPENSE,
                            accountFrom = accountIndex.find(it["accountName"]),
                            amountFrom = amount,
                            accountTo = accountIndex.find(it["expenseCategoryName"]),
                            amountTo = amount,
                            description = it["description"].nonNull(),
                        )
                    }
                    "income" -> {
                        val amount = it["amount"].parseAmount()
                        ImportDataParsedEntry(
                            rawEntries = listOf(it.toString()),
                            date = it["date"].date("yyyy-MM-dd"),
                            type = OperationType.INCOME,
                            accountFrom = accountIndex.find(it["incomeCategoryName"]),
                            amountFrom = amount,
                            accountTo = accountIndex.find(it["accountName"]),
                            amountTo = amount,
                            description = it["description"].nonNull(),
                        )
                    }
                    else -> {
                        val amountFrom = it["amountFrom"].parseAmount()
                        val amountTo = it["amountTo"].parseAmount()
                        ImportDataParsedEntry(
                            rawEntries = listOf(it.toString()),
                            date = it["date"].date("yyyy-MM-dd"),
                            type = if (amountFrom == amountTo) OperationType.TRANSFER else OperationType.EXCHANGE,
                            accountFrom = accountIndex.find(it["accountFromName"]),
                            amountFrom = amountFrom,
                            accountTo = accountIndex.find(it["accountToName"]),
                            amountTo = amountTo,
                            description = it["description"].nonNull(),
                        )
                    }
                }

            }
    }

    private fun MutableMap<String, AccountRecord>.find(name: String): AccountRecord = computeIfAbsent(name) {
        val account = accountService.getOrCreate(name, AccountType.ACCOUNT)
        accountConverter.toRecord(account)
    }

    private fun String.nonNull(): String = if (this == "null") "" else this

    private fun importRule(rule: String, parser: UUID) {
        readRules("$rule/main.csv")
            .onEach {
                val type = when (it.type) {
                    "expense" -> AccountType.EXPENSE
                    "income" -> AccountType.INCOME
                    else -> throw IllegalArgumentException("Unknown type ${it.type}")
                }
                val category = accountService.getOrCreate(it.category, type)
                val mapping = CategoryMapping(
                    parser = parser,
                    pattern = it.pattern,
                    category = category,
                )
                categoryMappingRepository.save(mapping)
            }
    }
}

private fun readRules(rules: String): List<Rule> = File("./server/src/main/resources/rules/$rules")
    .inputStream()
    .readCsv()
    .flatMap {
        val type = it["type"]
        val category = it["category"]
        val description = it["description"]
        val source = it["source"]
        if (type !in listOf("income", "expense", "")) {
            listOf()
        } else if (source.isNotEmpty()) {
            readRules(rules + File.separator + source)
                .map { Rule(type, category, it.pattern) }
        } else {
            listOf(Rule(type, category, description))
        }
    }

data class Rule(
    val type: String,
    val category: String,
    val pattern: String
)
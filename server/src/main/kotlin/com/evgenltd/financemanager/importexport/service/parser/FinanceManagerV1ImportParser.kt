package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.importexport.entity.CategoryMapping
import com.evgenltd.financemanager.importexport.entity.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.repository.CategoryMappingRepository
import com.evgenltd.financemanager.importexport.service.ImportParserService
import com.evgenltd.financemanager.reference.entity.AccountType
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
    private val tbcImportParser: TbcImportParser
) : ImportParser {

    override val id: UUID = UUID.fromString("f51b0bd4-8fbd-45c8-8709-12266a846b17")
    override val name: String = "Finance Manager v1.x"

    @PostConstruct
    fun postConstruct() {
        if (categoryMappingRepository.count() > 0) {
            return
        }

        importRule("tbc", tbcImportParser.id)
    }

    override fun parse(stream: InputStream): List<ImportDataParsedEntry> {
        TODO("Not yet implemented")
    }

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
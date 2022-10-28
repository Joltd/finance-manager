package com.evgenltd.financemanager.datamapping.component

import com.evgenltd.financemanager.common.component.readCsv
import com.evgenltd.financemanager.importdata.record.RawDataRecord

fun readRules(rawRules: String): RuleManager {
    val rules = readCsv(rawRules)
            .map {
                Rule(
                        Template(
                                it["date"].asRegex(),
                                it["description"].asRegex()
                        ),
                        Hint(
                                it["type"],
                                it["category"],
                                it["oppositeAccount"],
                                it["oppositeAmount"]
                        )
                )
            }

    return RuleManager(rules)
}

private fun String.asRegex(): Regex = if (this.isEmpty()) {
    ".*".toRegex()
} else {
    this.toRegex()
}

class RuleManager(private val rules: List<Rule>) {

    fun find(record: RawDataRecord): Hint? = rules
            .find { it.matches(record) }
            ?.hint

    private fun Rule.matches(record: RawDataRecord): Boolean =
            template.date.containsMatchIn(record.date.toString())
            && template.description.containsMatchIn(record.description)

}

class Rule(val template: Template, val hint: Hint)

class Template(val date: Regex, val description: Regex)

class Hint(
        val type: String,
        val category: String,
        val oppositeAccount: String,
        val oppositeAmount: String
)
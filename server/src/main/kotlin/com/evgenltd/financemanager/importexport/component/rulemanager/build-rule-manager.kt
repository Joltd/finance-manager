package com.evgenltd.financemanager.importexport.component.rulemanager

import com.evgenltd.financemanager.common.component.Row
import com.evgenltd.financemanager.common.component.readCsv
import java.io.File

fun buildRuleManager(path: String): RuleManager {
    return RuleManager(readRules(path))
}

private fun readRules(path: String): Map<Template, Hint> = readCsv(path)
        .flatMap { row ->
            val hint = row.toHint()
            val template = row.toTemplate()
            val source = row["source"]

            if (source.isNotEmpty()) {
                if (hint.type.isNotEmpty()) {
                    readRules(path + File.separator + source)
                            .keys
                            .map { it to hint }
                } else {
                    readRules(path + File.separator + source).map { it.key to it.value }
                }
            } else {
                listOf(template to hint)
            }
        }
        .associate { it }

private fun Row.toHint(): Hint = Hint(
        this["type"],
        this["category"],
        this["oppositeAccount"],
        this["oppositeAmount"]
)

private fun Row.toTemplate(): Template = Template(
        this["date"].asRegex(),
        this["amount"].asRegex(),
        this["description"].asRegex()
)

private fun String.asRegex(): Regex = if (this.isEmpty()) {
    ".*".toRegex()
} else {
    this.toRegex()
}
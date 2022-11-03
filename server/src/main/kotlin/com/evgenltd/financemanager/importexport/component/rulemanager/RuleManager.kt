package com.evgenltd.financemanager.importexport.component.rulemanager

import com.evgenltd.financemanager.importexport.record.RawDataRecord

class RuleManager(
        private val rules: Map<Template,Hint>
) {

    fun find(record: RawDataRecord): Hint? =
            rules.keys
                    .find { it.matches(record) }
                    ?.let { rules[it] }

    private fun Template.matches(record: RawDataRecord): Boolean =
            date.containsMatchIn(record.date.toString())
                    && amount.containsMatchIn(record.amount.toString())
                    && description.containsMatchIn(record.description)

}
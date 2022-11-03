package com.evgenltd.financemanager.importexport.component.rulemanager

data class Template(
        val date: Regex,
        val amount: Regex,
        val description: Regex
)
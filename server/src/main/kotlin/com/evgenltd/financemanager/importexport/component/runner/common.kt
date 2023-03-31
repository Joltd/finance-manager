package com.evgenltd.financemanager.importexport.component.runner

import com.evgenltd.financemanager.importexport.component.DocumentEntry
import com.evgenltd.financemanager.importexport.component.performImport
import com.evgenltd.financemanager.importexport.component.readFinance

fun common(
    file: String,
    host: String
) {
    readFinance(file)
        .map { DocumentEntry("", it) }
        .performImport(host, "Common")
}
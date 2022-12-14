package com.evgenltd.financemanager.document.record

import java.time.LocalDate

data class DocumentDailyFilter(val date: LocalDate, val account: String)
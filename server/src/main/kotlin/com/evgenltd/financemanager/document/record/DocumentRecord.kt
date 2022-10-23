package com.evgenltd.financemanager.document.record

import java.time.LocalDate

class DocumentRecord(val type: String, val id: String, val date: LocalDate, val description: String)
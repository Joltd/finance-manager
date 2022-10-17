package com.evgenltd.financemanager.importdata.record

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.transaction.entity.Direction
import java.time.LocalDate

class ImportDataRecord(
        val id: String?,
        val account: String?,
        val template: String?,
        val file: String?,
        val entries: List<ImportDataEntryRecord>
)

class ImportDataEntryRecord(
        val id: String,
        val fromDb: Boolean,
        val fromFile: Boolean,
        val systemId: String?,
        val date: LocalDate,
        val direction: Direction,
        val amount: Amount,
        val description: String
)
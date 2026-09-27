package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataTotal
import com.evgenltd.financemanager.importexport.record.ImportDataDateRange
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.record.ImportDataTotalRecord
import org.springframework.stereotype.Service

@Service
@SkipLogging
class ImportDataConverter(
    private val accountConverter: AccountConverter,
) {

    fun toReference(entity: ImportData): Reference = Reference(
        id = entity.id!!,
        name = "${entity.account.name} - ${entity.id!!.toString().substring(0, 4)}",
    )

    fun toRecord(importData: ImportData, dateRange: ImportDataDateRange, balances: Map<String, Amount>): ImportDataRecord =
        ImportDataRecord(
            id = importData.id!!,
            account = accountConverter.toAccountReference(importData.account),
            currency = importData.currency,
            dateRange = dateRange.takeIf { it.min != null && it.max != null }
                ?.let { Range(from = it.min, to = it.max) },
            parsingStatus = importData.parsingStatus,
            message = importData.message,
            valid = importData.valid,
            totals = importData.totals.map { toRecord(it, balances[it.currency]) },
        )

    private fun toRecord(total: ImportDataTotal, balance: Amount? = null): ImportDataTotalRecord =
        ImportDataTotalRecord(
            currency = total.currency,
            parsed = total.parsed,
            suggested = total.suggested,
            operation = total.operation,
            actual = total.actual,
            balance = balance ?: emptyAmount(total.currency),
            valid = total.valid,
        )
}

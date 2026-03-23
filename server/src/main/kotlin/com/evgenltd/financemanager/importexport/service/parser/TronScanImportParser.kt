package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.common.util.isZero
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.record.ImportDataParsed
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import com.evgenltd.financemanager.operation.entity.OperationType
import org.springframework.stereotype.Service
import java.io.InputStream

@Service
class TronScanImportParser : ImportParser {

    override val name: String = "TronScan"

    override fun parse(importData: ImportData, stream: InputStream): ImportDataParsed = ImportDataParsed(
        entries = stream
            .readCsv()
            .filter {
                it["Token Symbol"] == "USDT"
                        && it["Result"] == "SUCCESS"
                        && it["Status"] == "CONFIRMED"
            }
            .mapNotNull {
                val amount = it["Amount/TokenID"].amount("USDT")
                if (amount.isZero()) {
                    return@mapNotNull null
                }
                ImportDataParsedEntry(
                    rawEntries = listOf(it.toString()),
                    date = it["Time(UTC)"].dateTime("yyyy-MM-dd HH:mm:ss"),
                    type = OperationType.EXCHANGE,
                    accountFrom = null,
                    amountFrom = amount,
                    accountTo = null,
                    amountTo = amount,
                    description = it["Txn Hash"],
                )
            },
        failed = emptyList(),
    )
}
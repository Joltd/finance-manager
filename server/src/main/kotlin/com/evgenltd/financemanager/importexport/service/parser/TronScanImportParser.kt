package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataParsedEntry
import com.evgenltd.financemanager.operation.entity.OperationType
import org.springframework.stereotype.Service
import java.io.InputStream
import java.util.*

@Service
class TronScanImportParser : ImportParser {

    override val id: UUID = UUID.fromString("c453e28f-9cb6-4ace-bb7a-8ab809369e68")
    override val name: String = "TronScan"

    override fun parse(importData: ImportData?, stream: InputStream): List<ImportDataParsedEntry> = stream
        .readCsv()
        .filter { it["Token Symbol"] == "USDT" && it["Result"] == "SUCCESS" && it["Status"] == "CONFIRMED" }
        .map {
            ImportDataParsedEntry(
                rawEntries = listOf(it.toString()),
                date = it["Time(UTC)"].dateTime("yyyy-MM-dd HH:mm:ss"),
                type = OperationType.EXCHANGE,
                accountFrom = null,
                amountFrom = it["Amount/TokenID"].amount("USDT"),
                accountTo = null,
                amountTo = it["Amount/TokenID"].amount("USDT"),
                description = it["Txn Hash"],
            )
        }
}
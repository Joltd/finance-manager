package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.common.util.fromFractionalString
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.record.ImportDataParsed
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import com.evgenltd.financemanager.operation.entity.OperationType
import com.fasterxml.jackson.annotation.JsonProperty
import org.springframework.stereotype.Service
import tools.jackson.dataformat.csv.CsvMapper
import tools.jackson.dataformat.csv.CsvSchema
import tools.jackson.module.kotlin.KotlinModule
import java.io.InputStream

@Service
class TbcImportParser : ImportParser {

    override val name: String = "TBC"

    override fun parse(importData: ImportData, stream: InputStream): ImportDataParsed {
        val currency = importData.currency ?: throw RuntimeException("Currency must be specified")
        val account = importData.account

        val csvMapper = CsvMapper.builder()
            .addModule(KotlinModule.Builder().build())
            .build()

        val rows = stream.bufferedReader().use { reader ->
            reader.readLine() // Skip the first (Georgian) header line.
            val remaining = reader.readText()
            if (remaining.isBlank()) {
                return ImportDataParsed(emptyList(), emptyList())
            }
            val cleaned = remaining.removePrefix("\uFEFF")
            val schema = CsvSchema.emptySchema().withHeader().withColumnSeparator(',')
            csvMapper.readerFor(Row::class.java)
                .with(schema)
                .readValues<Row>(cleaned)
                .readAll()
        }

        return ImportDataParsed(
            entries = rows.map { row ->
            val paidOut = row.paidOut?.trim().orEmpty()
            val paidIn = row.paidIn?.trim().orEmpty()

            val (amount, type) = when {
                paidOut.isNotEmpty() -> fromFractionalString(paidOut, currency) to OperationType.EXPENSE
                paidIn.isNotEmpty() -> fromFractionalString(paidIn, currency) to OperationType.INCOME
                else -> throw IllegalStateException("Unable to parse amount from row $row")
            }

            val (accountFrom, accountTo) = when (type) {
                OperationType.EXPENSE -> account to null
                OperationType.INCOME -> null to account
                else -> null to null
            }

            ImportDataParsedEntry(
                raw = listOf(row.toString()),
                date = row.date!!.date("dd/MM/yyyy"),
                type = type,
                accountFrom = accountFrom,
                amountFrom = amount,
                accountTo = accountTo,
                amountTo = amount,
                description = row.description?.trim().orEmpty(),
            )
        },
            failed = emptyList(),
        )
    }

    data class Row(
        @field:JsonProperty("Date") val date: String? = null,
        @field:JsonProperty("Description") val description: String? = null,
        @field:JsonProperty("Additional Information") val additionalInformation: String? = null,
        @field:JsonProperty("Paid Out") val paidOut: String? = null,
        @field:JsonProperty("Paid In") val paidIn: String? = null,
        @field:JsonProperty("Balance") val balance: String? = null,
        @field:JsonProperty("Type") val type: String? = null,
        @field:JsonProperty("Document Date") val documentDate: String? = null,
        @field:JsonProperty("Document Number") val documentNumber: String? = null,
        @field:JsonProperty("Partner's Account") val partnerAccount: String? = null,
        @field:JsonProperty("Partner's Name") val partnerName: String? = null,
        @field:JsonProperty("Partner's Tax Code") val partnerTaxCode: String? = null,
        @field:JsonProperty("Partner's Bank Code") val partnerBankCode: String? = null,
        @field:JsonProperty("Partner's Bank") val partnerBank: String? = null,
        @field:JsonProperty("Intermediary Bank Code") val intermediaryBankCode: String? = null,
        @field:JsonProperty("Intermediary Bank") val intermediaryBank: String? = null,
        @field:JsonProperty("Charge Details") val chargeDetails: String? = null,
        @field:JsonProperty("Taxpayer Code") val taxpayerCode: String? = null,
        @field:JsonProperty("Taxpayer Name") val taxpayerName: String? = null,
        @field:JsonProperty("Treasury Code") val treasuryCode: String? = null,
        @field:JsonProperty("Op. Code") val opCode: String? = null,
        @field:JsonProperty("Additional Description") val additionalDescription: String? = null,
        @field:JsonProperty("Transaction ID") val transactionId: String? = null,
    )


}
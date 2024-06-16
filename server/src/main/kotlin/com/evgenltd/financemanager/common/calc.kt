package com.evgenltd.financemanager.common

import com.evgenltd.financemanager.common.component.readCsv
import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.dataformat.csv.CsvMapper
import com.fasterxml.jackson.dataformat.csv.CsvSchema
import java.io.File
import java.math.BigDecimal
import java.time.LocalDate

fun main1() {

    val mapper = CsvMapper().findAndRegisterModules()

    val schema = CsvSchema.builder()
        .addColumn("Date")
        .addColumn("Description")
        .addColumn("Additional Information")
        .addNumberColumn("Paid Out")
        .addNumberColumn("Paid In")
        .addNumberColumn("Balance")
        .addColumn("Type")
        .addColumn("Document Date")
        .addColumn("Document Number")
        .addColumn("Partner's Account")
        .addColumn("Partner's Name")
        .addColumn("Partner's Tax Code")
        .addColumn("Partner's Bank Code")
        .addColumn("Partner's Bank")
        .addColumn("Intermediary Bank Code")
        .addColumn("Intermediary Bank")
        .addColumn("Charge Details")
        .addColumn("Taxpayer Code")
        .addColumn("Taxpayer Name")
        .addColumn("Treasury Code")
        .addColumn("Op. Code")
        .addColumn("Additional Description")
        .addColumn("Transaction ID")
        .setSkipFirstDataRow(true)
        .build()

    val result = mapper.readerFor(TbcEntry::class.java)
        .with(schema)
        .readValues<TbcEntry>(File("C:\\Users\\lebed\\Downloads\\gel.csv"))
        .readAll()

    val amount = result.map { it.paidIn ?: it.paidOut!!.negate() }
        .reduce { acc, value -> acc + value }

    println(amount)

}

data class TbcEntry(
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @JsonProperty("Date") val date: LocalDate,
    @JsonProperty("Description") val description: String,
    @JsonProperty("Additional Information") val additionalInformation: String,
    @JsonProperty("Paid Out") val paidOut: BigDecimal?,
    @JsonProperty("Paid In") val paidIn: BigDecimal?,
    @JsonProperty("Balance") val balance: BigDecimal,
    @JsonProperty("Type") val type: String,
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @JsonProperty("Document Date") val documentDate: LocalDate,
    @JsonProperty("Document Number") val documentNumber: String,
    @JsonProperty("Partner's Account") val partnerAccount: String,
    @JsonProperty("Partner's Name") val partnerName: String,
    @JsonProperty("Partner's Tax Code") val partnerTaxCode: String,
    @JsonProperty("Partner's Bank Code") val partnerBankCode: String,
    @JsonProperty("Partner's Bank") val partnerBank: String,
    @JsonProperty("Intermediary Bank Code") val intermediaryBankCode: String,
    @JsonProperty("Intermediary Bank") val intermediaryBank: String,
    @JsonProperty("Charge Details") val chargeDetails: String,
    @JsonProperty("Taxpayer Code") val taxpayerCode: String,
    @JsonProperty("Taxpayer Name") val taxpayerName: String,
    @JsonProperty("Treasury Code") val treasuryCode: String,
    @JsonProperty("Op. Code") val opCode: String,
    @JsonProperty("Additional Description") val additionalDescription: String,
    @JsonProperty("Transaction ID") val transactionId: String,
) {}
























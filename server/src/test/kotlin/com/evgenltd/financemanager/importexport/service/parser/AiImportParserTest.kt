package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.ai.record.ParseEntry
import com.evgenltd.financemanager.ai.service.AiService
import com.evgenltd.financemanager.common.record.TransactionDirection
import com.evgenltd.financemanager.common.service.FileService
import com.evgenltd.financemanager.importexport.entity.ImportData
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.mock.web.MockMultipartFile
import java.io.InputStream
import java.nio.file.Path
import java.time.LocalDate

class AiImportParserTest {

    @TempDir
    lateinit var tempDir: Path

    private val aiService = mock<AiService>()

    @Test
    fun `parse - normalizes a complete AI entry and copies banking facts`() {
        val fileService = FileService(tempDir.toString())
        val filename = fileService.store(MockMultipartFile("file", "export.csv", "text/csv", "row".toByteArray()))
        val importData = ImportData(
            account = Account(name = "Bank", type = AccountType.ACCOUNT),
            currency = "rub",
        )
        whenever(aiService.parse(eq(filename), any<InputStream>(), eq("rub"))).thenReturn(
            listOf(
                ParseEntry(
                    raw = "01.02.2026;-125.50;Shop",
                    date = "2026-02-01",
                    direction = TransactionDirection.OUT,
                    amount = "-125.50",
                    currency = null,
                    transactionId = "tx-1",
                    mcc = "5411",
                    bankType = "Card payment",
                    bankCategory = "Groceries",
                    merchant = "Shop",
                    counterparty = "Shop LLC",
                    purpose = "Goods",
                    description = "Purchase at Shop",
                    message = null,
                )
            )
        )

        val result = AiImportParser(aiService, fileService).parse(importData, filename)

        assertThat(result).hasSize(1)
        val entry = result.first()
        assertThat(entry.raw).isEqualTo("01.02.2026;-125.50;Shop")
        assertThat(entry.date).isEqualTo(LocalDate.of(2026, 2, 1))
        assertThat(entry.direction).isEqualTo(TransactionDirection.OUT)
        assertThat(entry.amount).isEqualTo("125.50")
        assertThat(entry.currency).isEqualTo("RUB")
        assertThat(entry.transactionId).isEqualTo("tx-1")
        assertThat(entry.mcc).isEqualTo("5411")
        assertThat(entry.bankType).isEqualTo("Card payment")
        assertThat(entry.bankCategory).isEqualTo("Groceries")
        assertThat(entry.merchant).isEqualTo("Shop")
        assertThat(entry.counterparty).isEqualTo("Shop LLC")
        assertThat(entry.purpose).isEqualTo("Goods")
        assertThat(entry.description).isEqualTo("Purchase at Shop")
        assertThat(entry.message).isNull()
    }

    @Test
    fun `parse - preserves a partial entry and adds diagnostics for missing core facts`() {
        val fileService = FileService(tempDir.toString())
        val filename = fileService.store(MockMultipartFile("file", "export.csv", "text/csv", "broken".toByteArray()))
        val importData = ImportData(account = Account(name = "Bank", type = AccountType.ACCOUNT))
        whenever(aiService.parse(eq(filename), any<InputStream>(), eq(null))).thenReturn(
            listOf(
                ParseEntry(
                    raw = "broken row",
                    date = "not-a-date",
                    direction = null,
                    amount = "not-an-amount",
                    currency = null,
                    transactionId = null,
                    mcc = null,
                    bankType = null,
                    bankCategory = null,
                    merchant = "Known merchant",
                    counterparty = null,
                    purpose = null,
                    description = null,
                    message = "Unable to identify the transaction",
                )
            )
        )

        val result = AiImportParser(aiService, fileService).parse(importData, filename).single()

        assertThat(result.raw).isEqualTo("broken row")
        assertThat(result.date).isNull()
        assertThat(result.direction).isNull()
        assertThat(result.amount).isNull()
        assertThat(result.currency).isNull()
        assertThat(result.merchant).isEqualTo("Known merchant")
        assertThat(result.message)
            .contains("Unable to identify the transaction")
            .contains("Date is missing or invalid")
            .contains("Direction is missing")
            .contains("Amount is missing")
            .contains("Currency is missing")
    }
}

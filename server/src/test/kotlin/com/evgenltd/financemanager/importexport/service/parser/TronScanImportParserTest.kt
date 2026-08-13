package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.operation.entity.OperationType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets
import java.time.LocalDate

class TronScanImportParserTest {

    private val parser = TronScanImportParser()
    private val importData = ImportData(account = Account(name = "Wallet", type = AccountType.ACCOUNT))

    @Test
    fun `parse - keeps only successful, confirmed USDT transfers with a non-zero amount`() {
        val csv = """
            Token Symbol,Result,Status,Amount/TokenID,Time(UTC),Txn Hash
            USDT,SUCCESS,CONFIRMED,150.500000,2024-01-15 10:30:00,0xabc123
            BTC,SUCCESS,CONFIRMED,1.000000,2024-01-16 10:00:00,0xwrong-token
            USDT,FAILED,CONFIRMED,1.000000,2024-01-16 10:00:00,0xwrong-result
            USDT,SUCCESS,PENDING,1.000000,2024-01-16 10:00:00,0xwrong-status
            USDT,SUCCESS,CONFIRMED,0.000000,2024-01-17 10:00:00,0xzero-amount
        """.trimIndent()

        val result = parser.parse(importData, csv.toStream())

        assertThat(result.failed).isEmpty()
        assertThat(result.entries).hasSize(1)
        val entry = result.entries.first()
        assertThat(entry.date).isEqualTo(LocalDate.of(2024, 1, 15))
        assertThat(entry.type).isEqualTo(OperationType.EXCHANGE)
        assertThat(entry.amountFrom).isEqualTo(Amount(1505000L, "USDT")) // 150.5000 USDT
        assertThat(entry.amountTo).isEqualTo(entry.amountFrom)
        assertThat(entry.description).isEqualTo("0xabc123")
    }

    private fun String.toStream() = ByteArrayInputStream(toByteArray(StandardCharsets.UTF_8))
}

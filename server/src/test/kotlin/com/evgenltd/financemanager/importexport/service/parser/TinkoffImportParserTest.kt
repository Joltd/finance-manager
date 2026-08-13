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

class TinkoffImportParserTest {

    private val parser = TinkoffImportParser()
    private val importData = ImportData(account = Account(name = "Bank", type = AccountType.ACCOUNT))

    @Test
    fun `parse - maps an OK expense row to an EXPENSE entry with absolute amount`() {
        val csv = """
            date;col1;col2;status;col4;col5;amount;col7;col8;category;mcc;description
            15.01.2024 10:30:00;;;OK;;;-1000.00;;;Food;;Grocery shopping
        """.trimIndent()

        val result = parser.parse(importData, csv.toStream())

        assertThat(result.failed).isEmpty()
        assertThat(result.entries).hasSize(1)
        val entry = result.entries.first()
        assertThat(entry.date).isEqualTo(LocalDate.of(2024, 1, 15))
        assertThat(entry.type).isEqualTo(OperationType.EXPENSE)
        assertThat(entry.amountFrom).isEqualTo(Amount(10000000L, "RUB")) // 1000.0000 RUB, absolute value
        assertThat(entry.amountTo).isEqualTo(Amount(10000000L, "RUB"))
        assertThat(entry.description).isEqualTo("Food|Grocery shopping")
        assertThat(entry.hint).isEqualTo("Списание Grocery shopping - Food")
    }

    @Test
    fun `parse - maps an OK income row to an INCOME entry and appends mcc to the hint`() {
        val csv = """
            date;col1;col2;status;col4;col5;amount;col7;col8;category;mcc;description
            17.01.2024 12:00:00;;;OK;;;2000.00;;;Salary;5411;Monthly income
        """.trimIndent()

        val result = parser.parse(importData, csv.toStream())

        assertThat(result.entries).hasSize(1)
        val entry = result.entries.first()
        assertThat(entry.type).isEqualTo(OperationType.INCOME)
        assertThat(entry.amountFrom).isEqualTo(Amount(20000000L, "RUB")) // 2000.0000 RUB
        assertThat(entry.hint).isEqualTo("Поступление Monthly income - Salary (5411)")
    }

    @Test
    fun `parse - rows with a status other than OK are dropped`() {
        val csv = """
            date;col1;col2;status;col4;col5;amount;col7;col8;category;mcc;description
            16.01.2024 11:00:00;;;FAILED;;;-500.00;;;Food;;Should be filtered out
            15.01.2024 10:30:00;;;OK;;;-1000.00;;;Food;;Kept
        """.trimIndent()

        val result = parser.parse(importData, csv.toStream())

        assertThat(result.entries).hasSize(1)
        assertThat(result.entries.first().description).isEqualTo("Food|Kept")
    }

    private fun String.toStream() = ByteArrayInputStream(toByteArray(StandardCharsets.UTF_8))
}

package com.evgenltd.financemanager.importexport.service.parser

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.operation.entity.OperationType
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets
import java.time.LocalDate

class TbcImportParserTest {

    private val parser = TbcImportParser()
    private val account = Account(name = "TBC account", type = AccountType.ACCOUNT)

    @Test
    fun `parse - a Paid Out row becomes an EXPENSE from the account, a Paid In row becomes an INCOME to the account`() {
        val importData = ImportData(account = account, currency = "GEL")
        val csv = """
            Georgian header line, ignored
            Date,Description,Paid Out,Paid In
            15/01/2024,Grocery store,100.50,
            17/01/2024,Salary,,2000.75
        """.trimIndent()

        val result = parser.parse(importData, csv.toStream())

        assertThat(result.failed).isEmpty()
        assertThat(result.entries).hasSize(2)

        val expense = result.entries[0]
        assertThat(expense.date).isEqualTo(LocalDate.of(2024, 1, 15))
        assertThat(expense.type).isEqualTo(OperationType.EXPENSE)
        assertThat(expense.amountFrom).isEqualTo(Amount(1005000L, "GEL")) // 100.5000 GEL
        assertThat(expense.accountFrom).isSameAs(account)
        assertThat(expense.accountTo).isNull()
        assertThat(expense.description).isEqualTo("Grocery store")

        val income = result.entries[1]
        assertThat(income.date).isEqualTo(LocalDate.of(2024, 1, 17))
        assertThat(income.type).isEqualTo(OperationType.INCOME)
        assertThat(income.amountFrom).isEqualTo(Amount(20007500L, "GEL")) // 2000.7500 GEL
        assertThat(income.accountFrom).isNull()
        assertThat(income.accountTo).isSameAs(account)
        assertThat(income.description).isEqualTo("Salary")
    }

    @Test
    fun `parse - nothing left after skipping the first line yields no entries`() {
        val importData = ImportData(account = account, currency = "GEL")
        val csv = "Georgian header line, ignored\n"

        val result = parser.parse(importData, csv.toStream())

        assertThat(result.entries).isEmpty()
        assertThat(result.failed).isEmpty()
    }

    @Test
    fun `parse - a CSV header with no data rows yields no entries`() {
        val importData = ImportData(account = account, currency = "GEL")
        val csv = "Georgian header line, ignored\nDate,Description,Paid Out,Paid In\n"

        val result = parser.parse(importData, csv.toStream())

        assertThat(result.entries).isEmpty()
        assertThat(result.failed).isEmpty()
    }

    @Test
    fun `parse - missing currency on the import data throws`() {
        val importData = ImportData(account = account, currency = null)
        val csv = """
            Georgian header line, ignored
            Date,Description,Paid Out,Paid In
            15/01/2024,Grocery store,100.50,
        """.trimIndent()

        assertThatThrownBy { parser.parse(importData, csv.toStream()) }
            .isInstanceOf(RuntimeException::class.java)
    }

    private fun String.toStream() = ByteArrayInputStream(toByteArray(StandardCharsets.UTF_8))
}

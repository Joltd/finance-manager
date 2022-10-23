package com.evgenltd.financemanager.importdata.service.template

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.document.entity.DocumentExpense
import com.evgenltd.financemanager.document.entity.DocumentIncome
import com.evgenltd.financemanager.importdata.entity.DocumentEntry
import com.evgenltd.financemanager.transaction.entity.Direction
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.nio.file.Files
import java.nio.file.Path
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import kotlin.math.absoluteValue

@Component
@ImportDataTemplate.Info("Tinkoff Account")
class TinkoffTemplate : ImportDataTemplate {

    override fun convert(account: String, path: Path): List<DocumentEntry> {
        return Files.readAllLines(path)
                .filterIndexed { index, _ -> index > 0 }
                .map {
                    val parts = it.split(";")
                    Record(
                            it,
                            parts[0].date(),
                            parts[3].clean(),
                            parts[6].amount(),
                            parts[9].clean(),
                            parts[11].clean()
                    )
                }
                .filter { it.amount.compareTo(BigDecimal.ZERO) != 0 && it.status == "OK" }
                .map {

                    val amountValue = it.amount
                            .multiply(BigDecimal(10000))
                            .setScale(0)
                            .toLong()
                    val direction = if (amountValue < 0) Direction.OUT else Direction.IN
                    val amount = Amount(amountValue.absoluteValue, "RUB")

                    val document = if (direction == Direction.OUT) {
                        DocumentExpense(null, it.date, "Expense $amount", amount, account, "")
                    } else {
                        DocumentIncome(null, it.date, "Income $amount", amount, account, "")
                    }

                    DocumentEntry(
                            it.raw,
                            document
                    )
                }
    }

    private fun String.clean(): String = replace("\"", "").trim()

    private fun String.date(): LocalDate = LocalDateTime.parse(clean(), DATE_TIME_PATTERN).toLocalDate()

    private fun String.amount(): BigDecimal = clean()
            .replace(",", ".")
            .toBigDecimal()

    private companion object {
        val DATE_TIME_PATTERN: DateTimeFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss")
    }

    private data class Record(
            val raw: String,
            val date: LocalDate,
            val status: String,
            val amount: BigDecimal,
            val category: String,
            val description: String
    )

}
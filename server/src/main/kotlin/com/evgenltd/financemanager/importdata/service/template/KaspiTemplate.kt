package com.evgenltd.financemanager.importdata.service.template

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.document.entity.DocumentExpense
import com.evgenltd.financemanager.document.entity.DocumentIncome
import com.evgenltd.financemanager.importdata.entity.DocumentEntry
import com.evgenltd.financemanager.reference.record.ReferencePattern
import com.evgenltd.financemanager.reference.service.ExpenseCategoryService
import com.evgenltd.financemanager.reference.service.IncomeCategoryService
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.nio.file.Files
import java.nio.file.Path
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Component
@ImportDataTemplate.Info("Kaspi")
class KaspiTemplate(
        private val expenseCategoryService: ExpenseCategoryService,
        private val incomeCategoryService: IncomeCategoryService
) : ImportDataTemplate {

    override fun convert(account: String, path: Path): List<DocumentEntry> {
        val expensePatterns = expenseCategoryService.patterns()
        val incomePatterns = incomeCategoryService.patterns()
        var id = 1L
        return Files.readAllLines(path)
                .filterIndexed { index, _ -> index > 0 }
                .map {
                    val parts = it.split(";")
                    Record(
                            it,
                            parts[0].date(),
                            parts[1].clean(),
                            parts[2].amount(),
                            parts[3].clean(),
                            parts[4].clean()
                    )
                }
                .filter { it.amount.compareTo(BigDecimal.ZERO) != 0}
                .map {

                    val amountValue = it.amount
                            .multiply(BigDecimal(10000))
                            .setScale(0)
                            .toLong() * (if (it.sign == "-") -1 else 1)

                    val expenseCategory = expensePatterns.matches(it.category + "|" + it.description)
                    val incomeCategory = incomePatterns.matches(it.category + "|" + it.description)
                    val document = if (expenseCategory != null) {
                        DocumentExpense(
                                null,
                                it.date,
                                "",
                                Amount(-amountValue, "KZT"),
                                account,
                                expenseCategory
                        )
                    } else if (incomeCategory != null) {
                        DocumentIncome(
                                null,
                                it.date,
                                "",
                                Amount(amountValue, "KZT"),
                                account,
                                incomeCategory
                        )
                    } else {
                        null
                    }

                    DocumentEntry(
                            (id++).toString(),
                            it.raw,
                            document
                    )
                }
    }

    private fun String.clean(): String = trim()

    private fun String.date(): LocalDate = LocalDate.parse(clean(), DATE_TIME_PATTERN)

    private fun String.amount(): BigDecimal = clean()
            .replace("₸", "")
            .replace(",", ".")
            .replace(" ", "")
            .toBigDecimal()

    private fun List<ReferencePattern>.matches(value: String): String? = find { it.pattern.containsMatchIn(value) }?.id

    private companion object {
        val DATE_TIME_PATTERN: DateTimeFormatter = DateTimeFormatter.ofPattern("dd.MM.yy")
    }

    private data class Record(
            val raw: String,
            val date: LocalDate,
            val sign: String,
            val amount: BigDecimal,
            val category: String,
            val description: String
    )

}
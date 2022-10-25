package com.evgenltd.financemanager.importdata.service.template

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.document.entity.DocumentExpense
import com.evgenltd.financemanager.document.entity.DocumentIncome
import com.evgenltd.financemanager.importdata.entity.DocumentEntry
import com.evgenltd.financemanager.reference.record.ReferencePattern
import com.evgenltd.financemanager.reference.service.ExpenseCategoryService
import com.evgenltd.financemanager.reference.service.IncomeCategoryService
import org.jsoup.Jsoup
import org.jsoup.nodes.Element
import org.springframework.stereotype.Component
import java.io.File
import java.math.BigDecimal
import java.nio.file.Path
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Component
@ImportDataTemplate.Info("Bank CenterCredit")
class BccTemplate(
        private val expenseCategoryService: ExpenseCategoryService,
        private val incomeCategoryService: IncomeCategoryService
) : ImportDataTemplate {

    override fun convert(account: String, path: Path): List<DocumentEntry> {
        val expensePatterns = expenseCategoryService.patterns()
        val incomePatterns = incomeCategoryService.patterns()
        var id = 1L
        return Jsoup.parse(File(path.toString()))
                .select(".history__list__item")
                .map {
                    val descriptionNode = it.childNode(1).childNode(1)
                    val description = descriptionNode.childNode(0).childNode(0).toString().clean()
                    val date = descriptionNode.childNode(1).childNode(0).toString().clean()
                    val sign = it.sign()
                    val amount = it.childNode(3).childNode(0).childNode(3).toString().clean()
                    Record(
                            "$date $sign$amount $description",
                            date.date(),
                            sign,
                            amount.amount(),
                            description
                    )
                }
                .filter { it.amount.compareTo(BigDecimal.ZERO) != 0}
                .map {

                    val amountValue = it.amount
                            .multiply(BigDecimal(10000))
                            .setScale(0)
                            .toLong() * (if (it.sign == "-") -1 else 1)

                    val expenseCategory = expensePatterns.matches(it.description)
                    val incomeCategory = incomePatterns.matches(it.description)
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

    private fun Element.sign(): String {
        val root = childNode(3).childNode(0)
        val first = root.childNode(1)
        val second = root.childNode(2)
        return if (first.childNodeSize() > 0) {
            first.childNode(0).toString().clean()
        } else {
            second.childNode(0).toString().clean()
        }
    }
    private fun String.amount(): BigDecimal = clean()
            .replace("₸", "")
            .replace(" ", "")
            .toBigDecimal()

    private fun List<ReferencePattern>.matches(value: String): String? = find { it.pattern.containsMatchIn(value) }?.id

    private companion object {
        val DATE_TIME_PATTERN: DateTimeFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy")
    }

    private data class Record(
            val raw: String,
            val date: LocalDate,
            val sign: String,
            val amount: BigDecimal,
            val description: String
    )


}
package com.evgenltd.financemanager.importexport.service

import org.springframework.stereotype.Service

@Service
class ImportDataConverter(
//        private val accountRepository: AccountRepository,
//        private val expenseCategoryRepository: ExpenseCategoryRepository,
//        private val incomeCategoryRepository: IncomeCategoryRepository
) {
//
//    fun convert(path: Path): List<ImportDataEntryOld> {
//        val accountIndex = accountRepository.findAll().associateBy { it.name }.toMutableMap()
//        val expenseCategoryIndex = expenseCategoryRepository.findAll().associateBy { it.name }.toMutableMap()
//        val incomeCategoryIndex = incomeCategoryRepository.findAll().associateBy { it.name }.toMutableMap()
//        var id = 1L
//        return Files.readAllLines(path)
//                .filterIndexed { index, _ -> index > 0 }
//                .map { it.toRecord() }
//                .map {
//
//                    val document = when (it.type) {
//                        "expense" -> DocumentExpense(
//                                id = null,
//                                date = it.date,
//                                description = it.description,
//                                amount = it.amount.amount(),
//                                account = it.accountName.resolveAccount(accountIndex),
//                                expenseCategory = it.expenseCategoryName.resolveExpenseCategory(expenseCategoryIndex)
//                        )
//                        "income" -> DocumentIncome(
//                                id = null,
//                                date = it.date,
//                                description = it.description,
//                                amount = it.amount.amount(),
//                                account = it.accountName.resolveAccount(accountIndex),
//                                incomeCategory = it.incomeCategoryName.resolveIncomeCategory(incomeCategoryIndex)
//                        )
//                        "exchange" -> DocumentExchange(
//                                id = null,
//                                date = it.date,
//                                description = it.description,
//                                accountFrom = it.accountFromName.resolveAccount(accountIndex),
//                                amountFrom = it.amountFrom.amount(),
//                                accountTo = it.accountToName.resolveAccount(accountIndex),
//                                amountTo = it.amountTo.amount()
//                        )
//                        else -> throw IllegalArgumentException("Unknown document type [${it.type}]")
//                    }
//
//                    ImportDataEntryOld(
//                            (id++).toString(),
//                            it.toString(),
//                            document
//                    )
//                }
//    }
//
//    private fun String.toRecord(): Record {
//        val parts = split(",")
//        return Record(
//                parts[0],
//                parts[1],
//                parts[2],
//                parts[3].date(),
//                parts[4],
//                parts[5],
//                parts[6],
//                parts[7],
//                parts[8],
//                parts[9],
//                parts[10]
//        )
//    }
//
//    private fun String.resolveAccount(index: MutableMap<String,Account>): String {
//        val account = index[this]
//        if (account != null) {
//            return account.id!!
//        }
//
//        val newEntity = accountRepository.save(Account(null, this))
//        index[this] = newEntity
//        return newEntity.id!!
//    }
//
//    private fun String.resolveExpenseCategory(index: MutableMap<String,ExpenseCategory>): String {
//        val expenseCategory = index[this]
//        if (expenseCategory != null) {
//            return expenseCategory.id!!
//        }
//
//        val newEntity = expenseCategoryRepository.save(ExpenseCategory(null, this))
//        index[this] = newEntity
//        return newEntity.id!!
//    }
//
//    private fun String.resolveIncomeCategory(index: MutableMap<String,IncomeCategory>): String {
//        val incomeCategory = index[this]
//        if (incomeCategory != null) {
//            return incomeCategory.id!!
//        }
//
//        val newEntity = incomeCategoryRepository.save(IncomeCategory(null, this))
//        index[this] = newEntity
//        return newEntity.id!!
//    }
//
//    private fun String.date(): LocalDate = LocalDate.parse(trim(), DATE_TIME_PATTERN)
//
//    private fun String.amount(): Amount {
//        val parts = trim().split(" ")
//        return fromFractionalString(parts[0], parts[1])
//    }
//
//    private companion object {
//        val DATE_TIME_PATTERN: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
//    }
//
//    private data class Record(
//            val type: String,
//            val accountName: String,
//            val amount: String,
//            val date: LocalDate,
//            val description: String,
//            val expenseCategoryName: String,
//            val incomeCategoryName: String,
//            val accountFromName: String,
//            val accountToName: String,
//            val amountFrom: String,
//            val amountTo: String
//    )

}
package com.evgenltd.financemanager.user.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.account.record.CurrencyRecord
import com.evgenltd.financemanager.account.service.AccountService
import com.evgenltd.financemanager.account.service.CurrencyService
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.fromFractional
import com.evgenltd.financemanager.common.util.fromFractionalString
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.service.OperationProcessService
import com.evgenltd.financemanager.user.component.withTenant
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.TemporalAdjusters
import java.util.UUID
import kotlin.random.Random

/**
 * Generates a self-contained set of demo data (currencies, accounts, tags, several months of
 * operations - including currency exchanges) for a freshly created demo tenant. Runs entirely
 * through the normal service layer so that derived data (Balance/Turnover) is produced the same
 * way as for a real user, instead of being reimplemented here. Must run outside of an active
 * transaction: [OperationProcessService] is `@Transactional(propagation = Propagation.NEVER)`.
 */
@Service
class DemoDataGeneratorService(
    private val currencyService: CurrencyService,
    private val accountService: AccountService,
    private val operationProcessService: OperationProcessService,
) {

    private val primaryCurrency = "USD"
    private val monthsOfHistory = 6L

    // Rough, static conversion rates against the primary currency - good enough for
    // plausible-looking demo numbers, not meant to reflect real market rates.
    private val exchangeRates = mapOf(
        "EUR" to BigDecimal("0.92"),
        "GBP" to BigDecimal("0.79"),
        "BTC" to BigDecimal("0.0000155"),
    )

    fun generate(tenant: UUID) {
        withTenant(tenant) {
            exchangeRates.keys.plus(primaryCurrency).sorted().forEach {
                currencyService.update(CurrencyRecord(id = null, name = it, crypto = it == "BTC"))
            }

            val accounts = DemoAccounts(
                checking = createAccount("Checking", AccountType.ACCOUNT),
                savings = createAccount("Savings", AccountType.ACCOUNT),
                cash = createAccount("Cash", AccountType.ACCOUNT),
                cryptoWallet = createAccount("Crypto Wallet", AccountType.ACCOUNT),
                salary = createAccount("Salary", AccountType.INCOME),
                freelance = createAccount("Freelance", AccountType.INCOME),
                interest = createAccount("Interest", AccountType.INCOME),
                groceries = createAccount("Groceries", AccountType.EXPENSE),
                transport = createAccount("Transport", AccountType.EXPENSE),
                entertainment = createAccount("Entertainment", AccountType.EXPENSE),
                utilities = createAccount("Utilities", AccountType.EXPENSE),
                rent = createAccount("Rent", AccountType.EXPENSE),
                dining = createAccount("Dining", AccountType.EXPENSE),
                coffee = createAccount("Coffee", AccountType.EXPENSE),
                shopping = createAccount("Shopping", AccountType.EXPENSE),
                health = createAccount("Health", AccountType.EXPENSE),
                subscriptions = createAccount("Subscriptions", AccountType.EXPENSE),
            )

            operationProcessService.save(generateOperations(accounts))
        }
    }

    private fun createAccount(name: String, type: AccountType): Account {
        val id = accountService.update(
            AccountRecord(
                id = null,
                name = name,
                type = type,
                parser = null,
                deleted = false,
                reviseDate = null,
            )
        ).id!!
        return accountService.byIdOrNull(id)!!
    }

    private class DemoAccounts(
        val checking: Account,
        val savings: Account,
        val cash: Account,
        val cryptoWallet: Account,
        val salary: Account,
        val freelance: Account,
        val interest: Account,
        val groceries: Account,
        val transport: Account,
        val entertainment: Account,
        val utilities: Account,
        val rent: Account,
        val dining: Account,
        val coffee: Account,
        val shopping: Account,
        val health: Account,
        val subscriptions: Account,
    )

    private fun generateOperations(a: DemoAccounts): List<Operation> {
        val random = Random(System.nanoTime())
        val today = LocalDate.now()
        val operations = mutableListOf<Operation>()

        var month = today.minusMonths(monthsOfHistory).withDayOfMonth(1)
        while (!month.isAfter(today)) {
            fun inMonth(day: Int): LocalDate? = month.withDayOfMonth(day.coerceAtMost(month.lengthOfMonth()))
                .takeIf { !it.isAfter(today) }

            // Income
            inMonth(5)?.let {
                operations += income(it, a.salary, a.checking, amount(2800 + random.nextInt(400)), "Salary")
            }
            if (random.nextInt(100) < 40) {
                inMonth(15 + random.nextInt(10))?.let {
                    operations += income(it, a.freelance, a.checking, amount(200 + random.nextInt(600)), "Freelance project")
                }
            }
            if (random.nextInt(100) < 20) {
                inMonth(28)?.let {
                    operations += income(it, a.interest, a.savings, amount(5 + random.nextInt(25)), "Savings interest")
                }
            }

            // Fixed monthly expenses
            inMonth(1)?.let {
                operations += expense(it, a.checking, a.rent, amount(1200), "Rent")
            }
            inMonth(3)?.let {
                operations += expense(it, a.checking, a.utilities, amount(120 + random.nextInt(90)), "Utilities")
            }
            inMonth(7)?.let {
                operations += expense(it, a.checking, a.subscriptions, amount(15 + random.nextInt(20)), "Subscriptions")
            }
            inMonth(10)?.let {
                operations += transfer(it, a.checking, a.savings, amount(300 + random.nextInt(200)), "Monthly savings")
            }

            // Variable monthly expenses
            if (random.nextInt(100) < 60) {
                inMonth(1 + random.nextInt(month.lengthOfMonth()))?.let {
                    operations += expense(it, a.checking, a.health, amount(30 + random.nextInt(120)), "Pharmacy / gym")
                }
            }
            repeat(2 + random.nextInt(3)) {
                val day = 1 + random.nextInt(month.lengthOfMonth())
                inMonth(day)?.let {
                    operations += expense(it, a.checking, a.shopping, amount(30 + random.nextInt(150)), "Shopping")
                }
            }

            // Weekly / recurring expenses
            eachDayOfWeek(month, today, DayOfWeek.SATURDAY).forEach {
                operations += expense(it, a.checking, a.groceries, amount(50 + random.nextInt(70)), "Groceries")
            }
            eachDayOfWeek(month, today, DayOfWeek.WEDNESDAY).forEach {
                operations += expense(it, a.checking, a.groceries, amount(20 + random.nextInt(40)), "Groceries top-up")
            }
            eachDayOfWeek(month, today, DayOfWeek.MONDAY).forEach {
                operations += expense(it, a.cash, a.transport, amount(30 + random.nextInt(50)), "Transport")
            }
            eachDayOfWeek(month, today, DayOfWeek.THURSDAY).forEach {
                operations += expense(it, a.cash, a.transport, amount(20 + random.nextInt(40)), "Transport")
            }
            eachDayOfWeek(month, today, DayOfWeek.TUESDAY).forEach {
                operations += expense(it, a.cash, a.coffee, amount(4 + random.nextInt(6)), "Coffee")
            }
            eachDayOfWeek(month, today, DayOfWeek.FRIDAY).forEach {
                operations += expense(it, a.cash, a.coffee, amount(4 + random.nextInt(6)), "Coffee")
            }

            repeat(4 + random.nextInt(4)) {
                val day = 1 + random.nextInt(month.lengthOfMonth())
                inMonth(day)?.let {
                    operations += expense(it, a.checking, a.dining, amount(15 + random.nextInt(70)), "Dining out")
                }
            }
            repeat(2 + random.nextInt(3)) {
                val day = 1 + random.nextInt(month.lengthOfMonth())
                inMonth(day)?.let {
                    operations += expense(it, a.checking, a.entertainment, amount(20 + random.nextInt(80)), "Entertainment")
                }
            }

            // Currency exchanges
            if (random.nextInt(100) < 40) {
                inMonth(12 + random.nextInt(10))?.let {
                    operations += exchange(it, a.checking, a.checking, amount(300 + random.nextInt(500)), "EUR", "Currency exchange")
                }
            }
            if (random.nextInt(100) < 25) {
                inMonth(18 + random.nextInt(8))?.let {
                    operations += exchange(it, a.checking, a.checking, amount(200 + random.nextInt(400)), "GBP", "Currency exchange")
                }
            }
            if (random.nextInt(100) < 35) {
                inMonth(20 + random.nextInt(6))?.let {
                    operations += exchange(it, a.checking, a.cryptoWallet, amount(100 + random.nextInt(400)), "BTC", "Crypto purchase")
                }
            }

            month = month.plusMonths(1)
        }

        return operations
    }

    private fun eachDayOfWeek(month: LocalDate, today: LocalDate, dayOfWeek: DayOfWeek): List<LocalDate> {
        var date = month.with(TemporalAdjusters.firstInMonth(dayOfWeek))
        val dates = mutableListOf<LocalDate>()
        while (date.month == month.month && !date.isAfter(today)) {
            dates += date
            date = date.plusWeeks(1)
        }
        return dates
    }

    private fun amount(value: Int): Amount = fromFractionalString(value.toString(), primaryCurrency)

    private fun expense(date: LocalDate, from: Account, to: Account, amount: Amount, description: String) = Operation(
        date = date,
        type = OperationType.EXPENSE,
        amountFrom = amount,
        accountFrom = from,
        amountTo = amount,
        accountTo = to,
        description = description,
    )

    private fun income(date: LocalDate, from: Account, to: Account, amount: Amount, description: String) = Operation(
        date = date,
        type = OperationType.INCOME,
        amountFrom = amount,
        accountFrom = from,
        amountTo = amount,
        accountTo = to,
        description = description,
    )

    private fun transfer(date: LocalDate, from: Account, to: Account, amount: Amount, description: String) = Operation(
        date = date,
        type = OperationType.TRANSFER,
        amountFrom = amount,
        accountFrom = from,
        amountTo = amount,
        accountTo = to,
        description = description,
    )

    private fun exchange(date: LocalDate, from: Account, to: Account, fromAmount: Amount, toCurrency: String, description: String): Operation {
        val rate = exchangeRates.getValue(toCurrency)
        val toAmount = fromAmount.toBigDecimal().multiply(rate).fromFractional(toCurrency)
        return Operation(
            date = date,
            type = OperationType.EXCHANGE,
            amountFrom = fromAmount,
            accountFrom = from,
            amountTo = toAmount,
            accountTo = to,
            description = description,
        )
    }

}

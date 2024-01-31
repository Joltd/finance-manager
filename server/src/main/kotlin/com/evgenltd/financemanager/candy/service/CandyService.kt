package com.evgenltd.financemanager.candy.service

import com.evgenltd.financemanager.candy.converter.CandyConverter
import com.evgenltd.financemanager.candy.entity.Candy
import com.evgenltd.financemanager.candy.entity.Direction
import com.evgenltd.financemanager.candy.record.CandyDashboardRecord
import com.evgenltd.financemanager.candy.record.CandyExpenseRecord
import com.evgenltd.financemanager.candy.repository.CandyRepository
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.common.util.fromFractional
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.settings.service.SettingService
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class CandyService(
    private val candyRepository: CandyRepository,
    private val candyConverter: CandyConverter,
    private val exchangeRateService: ExchangeRateService,
    private val settingService: SettingService,
) {

    fun dashboard(): CandyDashboardRecord {
        val candies = candyRepository.findAll()

        val balanceUsd = candies.map {
            if (it.direction == Direction.IN) it.amountUsd else -it.amountUsd
        }.reduceOrNull { acc, amount -> acc + amount }
            ?: emptyAmount("USD")

        val defaultCurrency = settingService.operationDefaultCurrency() ?: "USD"
        val balance = balanceUsd.toCurrency(defaultCurrency)

        val lastExpenses = candies
            .filter { it.direction == Direction.OUT }
            .sortedByDescending { it.date }
            .take(5)
            .map { candyConverter.toExpense(it) }

        return CandyDashboardRecord(
            balance = balance,
            balanceUsd = balanceUsd,
            lastExpenses = lastExpenses
        )
    }

    fun createExpense(record: CandyExpenseRecord) {
        val candy = Candy(
            id = null,
            direction = Direction.OUT,
            date = record.date,
            amount = record.amount,
            amountUsd = record.amount.toCurrency("USD"),
            comment = record.comment
        )
        candyRepository.save(candy)
    }

    @Scheduled(cron = "0 0 0 * * *")
    fun createIncome() {
        val lastIncome = candyRepository.findFirstByDirectionOrderByDateDesc(Direction.IN)

        val now = LocalDate.now()

        val amount = settingService.candyIncomeAmount() ?: return
        val value = settingService.candyIncomeFrequencyValue() ?: return
        val unit = settingService.candyIncomeFrequencyUnit() ?: return

        val amountUsd = amount.toCurrency("USD")

        val createAllowed = lastIncome == null || now.minus(value, unit).isAfter(lastIncome.date)
        if (createAllowed) {
            val candy = Candy(
                id = null,
                direction = Direction.IN,
                date = now,
                amount = amount,
                amountUsd = amountUsd,
                comment = null,
            )
            candyRepository.save(candy)
        }
    }

    private fun Amount.toCurrency(target: String): Amount {
        val rate = exchangeRateService.actualRate(currency, target)
        return (toBigDecimal() * rate).fromFractional(target)
    }

}
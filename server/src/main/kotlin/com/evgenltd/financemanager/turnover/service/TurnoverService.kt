package com.evgenltd.financemanager.turnover.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.common.util.fromFractional
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.settings.service.SettingService
import com.evgenltd.financemanager.turnover.entity.Turnover
import com.evgenltd.financemanager.turnover.repository.TurnoverRepository
import jakarta.annotation.PostConstruct
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

@Service
class TurnoverService(
    private val turnoverRepository: TurnoverRepository,
    private val transactionRepository: TransactionRepository,
    private val exchangeRateService: ExchangeRateService,
    private val settingService: SettingService,
) : Loggable() {

    @PostConstruct
    fun postConstruct() {
        log.info("Initialized")
    }

    @Transactional
    fun rebuild(rebuildDate: LocalDate) {

        val date = rebuildDate.withDayOfMonth(1)

        turnoverRepository.deleteByDateGreaterThanEqual(date)

        val turnoverTotals = turnoverRepository.findAll()
            .groupingBy { it.toKey() } // key for all dimensions except date
            .aggregate { key, accumulator: Turnover?, turnover, first ->
                if (accumulator == null || turnover.date.isAfter(accumulator.date)) {
                    turnover
                } else {
                    accumulator
                }
            }
            .toMutableMap()

        val rateCache = mutableMapOf<RateKey,BigDecimal>()

        transactionRepository.findByDateGreaterThanEqual(date)
            .groupingBy { it.toKey() }
            .aggregate { key, accumulator: TransactionValue?, transaction, _ ->
                val amount = transaction.signedAmount()
                val amountUsd = rateCache.toUsd(transaction)
                val accumulatedAmount = accumulator?.amount?.plus(amount) ?: amount
                val accumulatedAmountUsd = accumulator?.amountUsd?.plus(amountUsd) ?: amountUsd
                TransactionValue(key.date, transaction.account, accumulatedAmount, accumulatedAmountUsd)
            }
            .map { it }
            .sortedBy { it.key.date }
            .onEach { (key, value) ->
                val turnoverKey = key.toKey()
                val lastTurnover = turnoverTotals[turnoverKey]
                Turnover(
                    id = null,
                    date = key.date,
                    account = value.account,
                    amount = value.amount,
                    amountUsd = value.amountUsd,
                    cumulativeAmount = lastTurnover?.cumulativeAmount?.plus(value.amount) ?: value.amount,
                    cumulativeAmountUsd = lastTurnover?.cumulativeAmountUsd?.plus(value.amountUsd) ?: value.amountUsd,
                ).let { turnoverRepository.save(it) }
                    .let { turnoverTotals[turnoverKey] = it }
            }

    }

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    fun rebuild() {
        val turnoverLastUpdate = settingService.turnoverLastUpdate() ?: LocalDateTime.of(2000, 1, 1, 0, 0)
        val transactionLastUpdate = transactionRepository.findFirstByOrderByUpdatedAtDesc()?.updatedAt ?: return

        val rebuild = transactionLastUpdate.isAfter(turnoverLastUpdate)
        if (rebuild) {
            rebuild(turnoverLastUpdate.toLocalDate())
            settingService.setTurnoverLastUpdate(transactionLastUpdate)
        }
    }

    private fun MutableMap<RateKey, BigDecimal>.toUsd(transaction: Transaction): Amount {
        val amount = transaction.signedAmount()
        if (amount.currency == "USD") {
            return amount
        }
        if (amount.currency == "TRX") {
            return emptyAmount("USD")
        }
        val date = transaction.date.withDayOfMonth(1)
        val key = RateKey(date, amount.currency, "USD")
        val rate = computeIfAbsent(key) { exchangeRateService.rate(date, amount.currency, "USD") }
        return (amount.toBigDecimal() * rate).fromFractional("USD")
    }

    private fun Transaction.toKey(): TransactionKey = TransactionKey(date.withDayOfMonth(1), account.id!!, amount.currency)

    private fun Turnover.toKey(): TurnoverKey = TurnoverKey(account.id!!, amount.currency)

    private fun TransactionKey.toKey(): TurnoverKey = TurnoverKey(accountId, currency)

    private data class RateKey(val date: LocalDate, val from: String, val to: String)

    private data class TurnoverKey(val accountId: UUID, val currency: String)

    private data class TransactionKey(val date: LocalDate, val accountId: UUID, val currency: String)

    private data class TransactionValue(val date: LocalDate, val account: Account, val amount: Amount, val amountUsd: Amount)

}
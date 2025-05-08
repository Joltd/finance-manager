package com.evgenltd.financemanager.turnover.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.entity.record.EntityFilterNodeRecord
import com.evgenltd.financemanager.entity.service.ConditionBuilderService
import com.evgenltd.financemanager.entity.service.EntityService
import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.settings.service.SettingService
import com.evgenltd.financemanager.turnover.entity.Turnover
import com.evgenltd.financemanager.turnover.record.TurnoverKey
import com.evgenltd.financemanager.turnover.repository.TurnoverRepository
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
    private val settingService: SettingService,
    private val conditionBuilderService: ConditionBuilderService,
    private val entityService: EntityService,
) : Loggable() {

    fun listByAccountType(): List<Turnover> = turnoverRepository.findByAccountType(AccountType.ACCOUNT)

    fun listByAccount(account: Account): List<Turnover> {
        return turnoverRepository.findByAccount(account)
    }

    fun list(filter: EntityFilterNodeRecord): List<Turnover> {
        val javaType = entityService.fields(Turnover::class.java)
        return turnoverRepository.findAll { root, _, cb ->
            conditionBuilderService.build(filter, javaType, root, cb)
        }
    }

    @Transactional
    fun rebuild(rebuildDate: LocalDate) {

        val date = rebuildDate.withDayOfMonth(1)

        turnoverRepository.deleteByDateGreaterThanEqual(date)

        val turnoverTotals = turnoverRepository.findByDateLessThan(date)
            .sliceLast()
            .toMutableMap()

        val rateCache = mutableMapOf<RateKey,BigDecimal>()

        transactionRepository.findByDateGreaterThanEqual(date)
            .groupingBy { it.toKey() }
            .aggregate { key, accumulator: TransactionValue?, transaction, _ ->
                val amount = transaction.signedAmount()
                val accumulatedAmount = accumulator?.amount?.plus(amount) ?: amount
                TransactionValue(key.date, transaction.account, accumulatedAmount)
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
                    cumulativeAmount = lastTurnover?.cumulativeAmount?.plus(value.amount) ?: value.amount,
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
        if (!rebuild) return

        try {
            rebuild(turnoverLastUpdate.toLocalDate())
            settingService.setTurnoverLastUpdate(transactionLastUpdate)
        } catch (e: Exception) {
            log.error("Failed to rebuild turnovers", e)
        }
    }

    private fun Transaction.toKey(): TransactionKey = TransactionKey(date.withDayOfMonth(1), account.id!!, amount.currency)

    private fun TransactionKey.toKey(): TurnoverKey = TurnoverKey(accountId, currency)

    private data class RateKey(val date: LocalDate, val from: String, val to: String)

    private data class TransactionKey(val date: LocalDate, val accountId: UUID, val currency: String)

    private data class TransactionValue(val date: LocalDate, val account: Account, val amount: Amount)

}
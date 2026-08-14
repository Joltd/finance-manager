package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.entity.Turnover
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.account.repository.TurnoverRepository
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.operation.service.signedAmount
import jakarta.persistence.EntityManager
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.*

@Service
class BalanceActionService(
    private val accountRepository: AccountRepository,
    private val balanceRepository: BalanceRepository,
    private val turnoverRepository: TurnoverRepository,
    private val transactionRepository: TransactionRepository,
    private val balanceEventService: BalanceEventService,
    private val entityManager: EntityManager,
) : Loggable() {

    @SkipLogging
    fun getBalancesForCalculation(): List<Balance> {
        return balanceRepository.findByCalculationDateIsNotNull()
    }

    fun findCurrencies(accountId: UUID): List<String> {
        val account = accountRepository.find(accountId)
        return balanceRepository.findByAccount(account).map { it.amount.currency }
    }

    @Transactional
    fun calculationRequest(tenant: UUID, accountId: UUID, currency: String, date: LocalDate) {
        balanceRepository.calculationRequest(tenant, accountId, currency, date)
    }

    @Transactional
    fun calculationCompleted(id: UUID?, calculationDate: LocalDate?, calculationVersion: Int?) {
        if (id == null || calculationDate == null || calculationVersion == null) {
            return
        }
        balanceRepository.calculationCompleted(id, calculationDate, calculationVersion)
    }

    @Transactional
    fun calculateBalance(accountId: UUID, currency: String): Balance? {
        val account = accountRepository.find(accountId)
        val balance = balanceRepository.findByAccountAndAmountCurrency(account, currency)
        if (balance == null) {
            log.warn("Balance not found for accountId: $accountId, currency: $currency")
            return null
        }
        // calculationRequest() sets calculationDate/calculationVersion via a native bulk update,
        // which bypasses Hibernate's session - under Open-Session-In-View, an already-loaded
        // Balance (e.g. from findCurrencies() earlier in the same request) would otherwise still
        // read those fields as stale/null here, silently skipping the recalculation below.
        entityManager.refresh(balance)

        val calculationDate = balance.calculationDate
        val calculationVersion = balance.calculationVersion
        if (calculationDate == null || calculationVersion == null) {
            log.warn("Balance is actual for accountId: $accountId, currency: $currency")
            return null
        }

        val cumulativeAmount = updateTurnover(account, currency, calculationDate)

        balance.amount = cumulativeAmount
        balance.date = LocalDate.now()
        return balance
    }

    private fun updateTurnover(account: Account, currency: String, date: LocalDate): Amount {
        val updateFrom = date.withDayOfMonth(1)

        turnoverRepository.deleteByAccountAndAmountCurrencyAndDateGreaterThanEqual(account, currency, updateFrom)

        var cumulativeAmount = turnoverRepository.findFirstByAccountAndAmountCurrencyAndDateLessThanOrderByDateDesc(account, currency, updateFrom)
            ?.cumulativeAmount
            ?: Amount(0, currency)

        transactionRepository.findByAccountAndAmountCurrencyAndDateGreaterThanEqual(account, currency, updateFrom)
            .groupingBy { it.date.withDayOfMonth(1) }
            .aggregate { _, accumulator: Amount?, element, _ ->
                element.signedAmount() + accumulator
            }
            .map { it }
            .sortedBy { it.key }
            .map {
                cumulativeAmount += it.value
                Turnover(
                    id = null,
                    tenant = account.tenant,
                    date = it.key,
                    account = account,
                    amount = it.value,
                    cumulativeAmount = cumulativeAmount
                )
            }
            .let { turnoverRepository.saveAll(it) }

        return cumulativeAmount
    }

}
package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.operation.service.signedAmount
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.entity.Turnover
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.account.repository.TurnoverRepository
import com.evgenltd.financemanager.common.component.Task
import com.evgenltd.financemanager.common.component.TaskKey
import com.evgenltd.financemanager.common.component.TaskVersion
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.user.component.withRootTenant
import com.evgenltd.financemanager.user.component.withTenant
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
) : Loggable() {

    @Task
    @Transactional
    fun updateBalance(@TaskKey accountId: UUID, @TaskKey currency: String, @TaskVersion(reversed = true) date: LocalDate) {
        val account = withRootTenant { accountRepository.find(accountId) }

        withTenant(account.tenant) {
            val cumulativeAmount = updateTurnover(account, currency, date)

            if (account.type == AccountType.ACCOUNT) {
                updateBalance(account, currency, date, cumulativeAmount)
            }
        }
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
                    date = it.key,
                    account = account,
                    amount = it.value,
                    cumulativeAmount = cumulativeAmount
                )
            }
            .let { turnoverRepository.saveAll(it) }

        return cumulativeAmount
    }

    private fun updateBalance(account: Account, currency: String, date: LocalDate, amount: Amount) {
        val balance = balanceRepository.findByAccountAndAmountCurrency(account, currency) ?: Balance(
            account = account,
            amount = Amount(0, currency),
            date = date,
        ).let { balanceRepository.save(it) }
        balance.amount = amount
        balance.date = LocalDate.now()

        balanceEventService.balance(balance.id!!)
    }

}
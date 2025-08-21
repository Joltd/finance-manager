package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.operation.record.OperationEvent
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.record.CalculateBalanceData
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.account.repository.TurnoverRepository
import com.evgenltd.financemanager.common.record.TaskExecutionEvent
import com.evgenltd.financemanager.common.record.TaskRequestEvent
import com.evgenltd.financemanager.common.repository.find
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.annotation.PostConstruct
import org.springframework.context.ApplicationEventPublisher
import org.springframework.context.event.EventListener
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service
import org.springframework.transaction.event.TransactionalEventListener
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@Service
class BalanceProcessService(
    private val balanceRepository: BalanceRepository,
    private val balanceActionService: BalanceActionService,
    private val turnoverRepository: TurnoverRepository,
) : Loggable() {

    @PostConstruct
    fun init() {
        if (balanceRepository.count() > 0L) {
            return
        }

        turnoverRepository.findByAccountType(AccountType.ACCOUNT)
            .sliceLast()
            .map {
                Balance(
                    id = null,
                    account = it.value.account,
                    amount = it.value.cumulativeAmount,
                    date = LocalDate.now(),
                )
            }
            .let { balanceRepository.saveAll(it) }
    }

    @TransactionalEventListener
    @Order(10)
    fun operationChanged(event: OperationEvent) {
        event.entries
            .asSequence()
            .flatMap { listOf(it.old, it.new) }
            .filterNotNull()
            .flatMap {
                listOf(
                    TransactionKey(it.date, it.accountFrom, it.amountFrom.currency),
                    TransactionKey(it.date, it.accountTo, it.amountTo.currency),
                )
            }
            .filter { it.account.type == AccountType.ACCOUNT }
            .distinct()
            .onEach {
//                val data = CalculateBalanceData(
//                    account = it.account.id!!,
//                    currency = it.currency,
//                    date = it.date.withDayOfMonth(1),
//                )
//                publisher.publishEvent(
//                    TaskRequestEvent(
//                        kind = KIND,
//                        key = "${data.account}-${data.currency}",
//                        deep = ChronoUnit.MONTHS.between(data.date, LocalDate.now()).toInt(),
//                        payload = mapper.valueToTree(data)
//                    ))
                balanceActionService.updateBalance(it.account.id!!, it.currency, it.date)
            }
            .toList()
    }

    private data class TransactionKey(val date: LocalDate, val account: Account, val currency: String)

}
package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.operation.record.OperationEvent
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.account.repository.TurnoverRepository
import jakarta.annotation.PostConstruct
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.transaction.event.TransactionalEventListener
import java.time.LocalDate
import java.util.UUID

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
    @Async
    fun operationChanged(event: OperationEvent) {
        event.entries
            .asSequence()
            .flatMap { listOf(it.old, it.new) }
            .filterNotNull()
            .flatMap {
                listOf(
                    TransactionKey(it.date, it.accountFrom.id!!, it.accountFrom.type, it.amountFrom.currency),
                    TransactionKey(it.date, it.accountTo.id!!, it.accountTo.type, it.amountTo.currency),
                )
            }
            .filter { it.accountType == AccountType.ACCOUNT }
            .distinct()
            .toList()
            .onEach {
                balanceActionService.updateBalance(it.accountId, it.currency, it.date)
            }
    }

    private data class TransactionKey(val date: LocalDate, val accountId: UUID, val accountType: AccountType, val currency: String)

}
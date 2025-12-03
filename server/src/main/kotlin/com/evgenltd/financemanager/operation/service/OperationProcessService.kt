package com.evgenltd.financemanager.operation.service

import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.service.BalanceActionService
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.AccountBalanceChangeStateRecord
import com.evgenltd.financemanager.operation.record.OperationChangeStateRecord
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.record.OperationChangeRecord
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class OperationProcessService(
    private val operationService: OperationService,
    private val operationEventService: OperationEventService,
    private val balanceActionService: BalanceActionService,
) {

    fun update(record: OperationRecord): UUID {
        val (old, new) = operationService.update(record)
        notifyChanges(old, new)
        return new?.id!!
    }

    fun save(operations: List<Operation>): List<UUID> {
        val changes = operationService.save(operations)
        notifyChanges(changes)
        return changes.map { it.new?.id!! }
    }

    fun delete(id: UUID) {
        val (old, new) = operationService.delete(id)
        notifyChanges(old, new)
    }

    fun delete(ids: List<UUID>) {
        val changes = operationService.delete(ids)
        notifyChanges(changes)
    }

    private fun notifyChanges(old: OperationChangeStateRecord?, new: OperationChangeStateRecord?) {
        notifyChanges(listOf(OperationChangeRecord(old, new)))
    }

    private fun notifyChanges(changes: List<OperationChangeRecord>) {
        operationEventService.operation()
        changes.asSequence()
            .filter { (old, new) -> isOperationChanged(old, new) }
            .flatMap { (old, new) -> listOf(old, new) }
            .filterNotNull()
            .flatMap {
                listOf(
                    it.accountFromChange(),
                    it.accountToChange(),
                )
            }
            .filterNotNull()
            .distinct()
            .toList()
            .onEach {
                balanceActionService.updateBalance(it.account, it.currency, it.date)
            }
    }

    private fun isOperationChanged(old: OperationChangeStateRecord?, new: OperationChangeStateRecord?): Boolean =
        old == null || new == null
                || !old.date.isEqual(new.date)
                || old.type == new.type
                || old.amountFrom != new.amountFrom
                || old.accountFrom != new.accountFrom
                || old.amountTo != new.amountTo
                || old.accountTo != new.accountTo

    private fun OperationChangeStateRecord.accountFromChange(): AccountBalanceChangeStateRecord? = takeIf { it.accountFromType == AccountType.ACCOUNT }
        ?.let { AccountBalanceChangeStateRecord(it.accountFrom, it.amountFrom.currency, it.date) }

    private fun OperationChangeStateRecord.accountToChange(): AccountBalanceChangeStateRecord? = takeIf { it.accountToType == AccountType.ACCOUNT }
        ?.let { AccountBalanceChangeStateRecord(it.accountTo, it.amountTo.currency, it.date) }


}
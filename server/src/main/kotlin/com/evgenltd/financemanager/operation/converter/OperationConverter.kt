package com.evgenltd.financemanager.operation.converter

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.reference.converter.AccountConverter
import com.evgenltd.financemanager.reference.record.AccountRecord
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class OperationConverter(
    private val operationRepository: OperationRepository,
    private val accountConverter: AccountConverter
) {

    fun toRecord(id: UUID): OperationRecord = toRecord(operationRepository.find(id))

    fun toRecord(entity: Operation): OperationRecord = OperationRecord(
        id = entity.id,
        date = entity.date,
        type = entity.type,
        amountFrom = entity.amountFrom,
        accountFrom = entity.accountFrom.let { accountConverter.toRecord(it) },
        amountTo = entity.amountTo,
        accountTo = entity.accountTo.let { accountConverter.toRecord(it) },
        description = entity.description
    )

    fun toEntity(record: OperationRecord): Operation = Operation(
        id = record.id,
        date = record.date,
        type = record.type,
        amountFrom = record.amountFrom,
        accountFrom = accountConverter.toEntity(record.accountFrom),
        amountTo = record.amountTo,
        accountTo = accountConverter.toEntity(record.accountTo),
        description = record.description
    )

}
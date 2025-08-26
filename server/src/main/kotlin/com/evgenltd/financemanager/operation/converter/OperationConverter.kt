package com.evgenltd.financemanager.operation.converter

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.ai.converter.EmbeddingConverter
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class OperationConverter(
    private val accountRepository: AccountRepository,
    private val accountConverter: AccountConverter,
    private val embeddingConverter: EmbeddingConverter,
) {

    fun toRecord(entity: Operation): OperationRecord = OperationRecord(
        id = entity.id,
        date = entity.date,
        type = entity.type,
        amountFrom = entity.amountFrom,
        accountFrom = entity.accountFrom.let { accountConverter.toRecord(it) },
        amountTo = entity.amountTo,
        accountTo = entity.accountTo.let { accountConverter.toRecord(it) },
        description = entity.description,
        raw = entity.raw,
        hint = entity.hint?.let { embeddingConverter.toRecord(it) },
    )

    fun fillEntity(entity: Operation?, record: OperationRecord): Operation = entity?.also {
        it.date = record.date
        it.type = record.type
        it.amountFrom = record.amountFrom
        it.accountFrom = record.accountFrom.id.let { id -> accountRepository.find(id) }
        it.amountTo = record.amountTo
        it.accountTo = record.accountTo.id.let { id -> accountRepository.find(id) }
        it.description = record.description
    } ?: Operation(
        date = record.date,
        type = record.type,
        amountFrom = record.amountFrom,
        accountFrom = record.accountFrom.id.let { accountRepository.find(it) },
        amountTo = record.amountTo,
        accountTo = record.accountTo.id.let { accountRepository.find(it) },
        description = record.description,
    )

}
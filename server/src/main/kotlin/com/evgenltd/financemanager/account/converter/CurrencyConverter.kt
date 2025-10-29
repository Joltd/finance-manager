package com.evgenltd.financemanager.account.converter

import com.evgenltd.financemanager.account.entity.Currency
import com.evgenltd.financemanager.account.record.CurrencyRecord
import com.evgenltd.financemanager.account.repository.CurrencyRepository
import com.evgenltd.financemanager.common.record.Reference
import org.springframework.stereotype.Service

@Service
class CurrencyConverter(
    private val currencyRepository: CurrencyRepository,
) {

    fun toRecord(entity: Currency): CurrencyRecord = CurrencyRecord(
        id = entity.id,
        name = entity.name,
        crypto = entity.crypto,
    )

    fun toEntity(name: String): Currency = currencyRepository.findByName(name)

    fun fillEntity(entity: Currency?, record: CurrencyRecord): Currency = entity?.also {
        it.name = record.name
        it.crypto = record.crypto
    } ?: Currency(
        id = record.id,
        name = record.name,
        crypto = record.crypto,
    )

    fun toReference(entity: Currency): Reference = Reference(
        id = entity.id!!,
        name = entity.name,
    )

}
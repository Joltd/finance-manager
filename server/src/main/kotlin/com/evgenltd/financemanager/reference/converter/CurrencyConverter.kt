package com.evgenltd.financemanager.reference.converter

import com.evgenltd.financemanager.reference.entity.Currency
import com.evgenltd.financemanager.reference.record.CurrencyRecord
import org.springframework.stereotype.Service

@Service
class CurrencyConverter {

    fun toRecord(entity: Currency): CurrencyRecord = CurrencyRecord(
        id = entity.id,
        name = entity.name,
        crypto = entity.crypto
    )

    fun toEntity(record: CurrencyRecord): Currency = Currency(
        id = record.id,
        name = record.name,
        crypto = record.crypto
    )

}
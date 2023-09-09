package com.evgenltd.financemanager.exchangerate.converter

import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateRecord
import org.springframework.stereotype.Service
import java.time.DayOfWeek

@Service
class ExchangeRateConverter {

    fun toRecord(entity: ExchangeRate): ExchangeRateRecord = ExchangeRateRecord(
        id = entity.id,
        date = entity.date,
        from = entity.from,
        to = entity.to,
        value = entity.value
    )

    fun toEntity(record: ExchangeRateRecord): ExchangeRate = ExchangeRate(
        id = record.id,
        date = record.date.with(DayOfWeek.MONDAY),
        from = record.from,
        to = record.to,
        value = record.value
    )

}
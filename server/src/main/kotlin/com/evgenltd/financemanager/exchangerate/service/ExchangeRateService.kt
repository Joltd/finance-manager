package com.evgenltd.financemanager.exchangerate.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.document.repository.DocumentExchangeRepository
import com.evgenltd.financemanager.exchangerate.entity.ExchangeRate
import com.evgenltd.financemanager.exchangerate.record.ExchangeRateRecord
import com.evgenltd.financemanager.exchangerate.repository.ExchangeRateRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import javax.annotation.PostConstruct

@Service
class ExchangeRateService(
        private val exchangeRateRepository: ExchangeRateRepository,
        private val documentExchangeRepository: DocumentExchangeRepository
) {

    @PostConstruct
    fun postConstruct() {
        documentExchangeRepository.findByAccountFromNotNull()
                .onEach { saveRate(it.date, it.amountFrom, it.amountTo) }
    }

    fun list(): List<ExchangeRateRecord> = exchangeRateRepository.findAll().map { it.toRecord() }

    fun byId(id: String): ExchangeRateRecord = exchangeRateRepository.find(id).toRecord()

    fun update(record: ExchangeRateRecord) {
        if (record.from == record.to) {
            return
        }
        val entity = record.toEntity()
        exchangeRateRepository.save(entity)
    }

    fun delete(id: String) = exchangeRateRepository.deleteById(id)

    fun saveRate(date: LocalDate, from: Amount, to: Amount) {
        if (from.currency == to.currency) {
            return
        }
        val entity = exchangeRateRepository.findByDateAndFromAndTo(date, from.currency, to.currency)
                ?: ExchangeRate(null, LocalDate.now(), "", "", BigDecimal.ZERO)
        entity.date = date
        entity.from = from.currency
        entity.to = to.currency
        entity.value = from.toBigDecimal().div(to.toBigDecimal())
        exchangeRateRepository.save(entity)
    }

    fun rate(date: LocalDate, from: String, to: String): BigDecimal {
        if (from == to) {
            return BigDecimal.ONE
        }
        val rate = exchangeRateRepository.findByDateLessThanEqual(date)
                .filter { (it.from == from && it.to == to) || (it.from == to || it.to == it.from) }
                .maxByOrNull { it.date }
                ?: throw IllegalStateException("No rate for $from/$to $date")

        return if (rate.from == from && rate.to == to) {
            rate.value
        } else {
            BigDecimal.ONE.divide(rate.value, 4, RoundingMode.HALF_DOWN)
        }
    }

    private fun ExchangeRate.toRecord(): ExchangeRateRecord = ExchangeRateRecord(
            id = id,
            date = date,
            from = from,
            to = to,
            value = value
    )

    private fun ExchangeRateRecord.toEntity(): ExchangeRate = ExchangeRate(
            id = id,
            date = date,
            from = from,
            to = to,
            value = value
    )

}
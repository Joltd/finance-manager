package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.reference.converter.CurrencyConverter
import com.evgenltd.financemanager.reference.entity.Currency
import com.evgenltd.financemanager.reference.record.CurrencyRecord
import com.evgenltd.financemanager.reference.record.Reference
import com.evgenltd.financemanager.reference.repository.CurrencyRepository
import jakarta.annotation.PostConstruct
import org.springframework.stereotype.Service
import java.util.*

@Service
class CurrencyService(
    private val currencyRepository: CurrencyRepository,
    private val currencyConverter: CurrencyConverter
) {

    @PostConstruct
    fun postConstruct() {
        if (currencyRepository.count() > 0L) {
            return
        }

        currencyRepository.save(Currency(name = "USD", crypto = false))
        currencyRepository.save(Currency(name = "EUR", crypto = false))
        currencyRepository.save(Currency(name = "KZT", crypto = false))
        currencyRepository.save(Currency(name = "TRY", crypto = false))
        currencyRepository.save(Currency(name = "RSD", crypto = false))
        currencyRepository.save(Currency(name = "GEL", crypto = false))
        currencyRepository.save(Currency(name = "RUB", crypto = false))
        currencyRepository.save(Currency(name = "USDT", crypto = true))
        currencyRepository.save(Currency(name = "TRX", crypto = true))
    }

    fun listReference(mask: String? = null, id: UUID? = null): List<Reference> {
        val list = if (mask?.isNotEmpty() == true) {
            currencyRepository.findByNameLike(mask)
        } else if (id != null) {
            currencyRepository.findById(id)
                .map { listOf(it) }
                .orElse(emptyList())
        } else {
            currencyRepository.findAll()
        }
        return list.map { Reference(it.id!!, it.name, false) }
            .sortedBy { it.name }
    }

    fun list(): List<CurrencyRecord> = currencyRepository.findAll()
        .map { currencyConverter.toRecord(it) }
        .sortedBy { it.name }

    fun byId(id: UUID): CurrencyRecord = currencyRepository.find(id).let { currencyConverter.toRecord(it) }

    fun update(record: CurrencyRecord) = currencyRepository.save(currencyConverter.toEntity(record))

    fun delete(id: UUID) = currencyRepository.deleteById(id)

}
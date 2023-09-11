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

        currencyRepository.save(Currency(name = "USD", crypto = false, position = 0))
        currencyRepository.save(Currency(name = "EUR", crypto = false, position = 3))
        currencyRepository.save(Currency(name = "KZT", crypto = false, position = 10))
        currencyRepository.save(Currency(name = "TRY", crypto = false, position = 10))
        currencyRepository.save(Currency(name = "RSD", crypto = false, position = 10))
        currencyRepository.save(Currency(name = "GEL", crypto = false, position = 1))
        currencyRepository.save(Currency(name = "RUB", crypto = false, position = 10))
        currencyRepository.save(Currency(name = "USDT", crypto = true, position = 2))
        currencyRepository.save(Currency(name = "TRX", crypto = true, position = 10))
    }

    fun listReference(mask: String? = null, id: UUID? = null): List<Reference> {
        val list = if (mask?.isNotEmpty() == true) {
            currencyRepository.findByNameLike(mask)
                .sortedWith(compareBy( { it.position }, { it.name }))
        } else if (id != null) {
            currencyRepository.findById(id)
                .map { listOf(it) }
                .orElse(emptyList())
        } else {
            currencyRepository.findAll()
                .sortedWith(compareBy( { it.position }, { it.name }))
        }
        return list.map { Reference(it.id!!, it.name, false) }
    }

    fun list(): List<CurrencyRecord> = currencyRepository.findAll()
        .sortedWith(compareBy( { it.position }, { it.name }))
        .map { currencyConverter.toRecord(it) }

    fun byId(id: UUID): CurrencyRecord = currencyRepository.find(id).let { currencyConverter.toRecord(it) }

    fun update(record: CurrencyRecord) = currencyRepository.save(currencyConverter.toEntity(record))

    fun delete(id: UUID) = currencyRepository.deleteById(id)

}
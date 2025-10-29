package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.account.converter.CurrencyConverter
import com.evgenltd.financemanager.account.entity.Currency
import com.evgenltd.financemanager.account.record.CurrencyRecord
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.account.repository.CurrencyRepository
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.like
import jakarta.annotation.PostConstruct
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.*

@Service
@SkipLogging
class CurrencyService(
    private val currencyRepository: CurrencyRepository,
    private val currencyConverter: CurrencyConverter,
    private val currencyEventService: CurrencyEventService,
) {

    fun listReference(mask: String? = null, id: UUID? = null): List<Reference> =
        ((Currency::name like mask) and  (Currency::id eq id))
            .let { currencyRepository.findAll(it, Sort.by(Currency::position.name, Currency::name.name)) }
            .map { currencyConverter.toReference(it) }

    fun list(): List<CurrencyRecord> = currencyRepository.findAll(Sort.by(Currency::position.name, Currency::name.name))
        .map { currencyConverter.toRecord(it) }

    fun byId(id: UUID): CurrencyRecord = currencyRepository.find(id).let { currencyConverter.toRecord(it) }

    fun update(record: CurrencyRecord) = record.id
        ?.let { currencyRepository.findByIdOrNull(it) }
        .let { currencyConverter.fillEntity(it, record) }
        .let { currencyRepository.save(it) }
        .let { currencyConverter.toRecord(it) }
        .also { currencyEventService.currency() }

    fun delete(id: UUID) = currencyRepository.deleteById(id)
        .also { currencyEventService.currency() }

}

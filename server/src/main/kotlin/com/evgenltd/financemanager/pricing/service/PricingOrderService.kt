package com.evgenltd.financemanager.pricing.service

import com.evgenltd.financemanager.common.record.EntityPageResponse
import com.evgenltd.financemanager.common.record.Range
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.itemEq
import com.evgenltd.financemanager.common.service.until
import com.evgenltd.financemanager.common.service.withMonday
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.common.util.fromFractional
import com.evgenltd.financemanager.common.util.oppositeRate
import com.evgenltd.financemanager.exchangerate.entity.BASE_CURRENCY
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.pricing.converter.PricingOrderConverter
import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.record.PricingOrderDefaults
import com.evgenltd.financemanager.pricing.record.PricingOrderFilter
import com.evgenltd.financemanager.pricing.record.PricingOrderRecord
import com.evgenltd.financemanager.pricing.repository.PricingOrderRepository
import com.evgenltd.financemanager.settings.service.SettingService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.MathContext
import java.math.RoundingMode
import java.time.LocalDate
import java.util.UUID

@Service
class PricingOrderService(
    private val pricingOrderRepository: PricingOrderRepository,
    private val pricingOrderConverter: PricingOrderConverter,
    private val settingService: SettingService,
    private val exchangeRateService: ExchangeRateService,
) : Loggable() {

    fun loadDefaults(): PricingOrderDefaults {
        val settings = settingService.load()
        val lastOrder = pricingOrderRepository.findFirstByOrderByCreatedAtDesc()
        return PricingOrderDefaults(
            date = lastOrder?.date ?: LocalDate.now(),
            currency = settings.operationDefaultCurrency?.name,
            country = lastOrder?.country ?: "",
            city = lastOrder?.city ?: "",
            store = lastOrder?.store ?: "",
            comment = lastOrder?.comment,
        )
    }

    fun list(filter: PricingOrderFilter): EntityPageResponse<PricingOrderRecord> {
        val spec = (PricingOrder::date between (filter.date?.from until filter.date?.to)) and
            (PricingOrder::item itemEq filter.item) and
            (PricingOrder::country eq filter.country) and
            (PricingOrder::city eq filter.city) and
            (PricingOrder::store eq filter.store)
        val page = pricingOrderRepository.findAll(
            spec,
            PageRequest.of(filter.page, filter.size, Sort.by(PricingOrder::date.name).descending()),
        )
        return EntityPageResponse(
            page = filter.page,
            size = filter.size,
            records = page.content.map { pricingOrderConverter.toRecord(it) },
            total = page.totalElements,
        )
    }

    fun byId(id: UUID): PricingOrderRecord = pricingOrderRepository.find(id).let { pricingOrderConverter.toRecord(it) }

    @Transactional
    fun update(record: PricingOrderRecord): PricingOrderRecord = record.id
        ?.let { pricingOrderRepository.findByIdOrNull(it) }
        .let { pricingOrderConverter.fillEntity(it, record) }
        .let { pricingOrderRepository.save(it) }
        .let { pricingOrderConverter.toRecord(it) }

    @Transactional
    fun delete(id: UUID) = pricingOrderRepository.deleteById(id)

    fun listDistinctCountries(mask: String?): List<String> = pricingOrderRepository.findDistinctCountries()
        .filter { mask == null || it.contains(mask, ignoreCase = true) }

    fun listDistinctCities(mask: String?): List<String> = pricingOrderRepository.findDistinctCities()
        .filter { mask == null || it.contains(mask, ignoreCase = true) }

    fun listDistinctStores(mask: String?): List<String> = pricingOrderRepository.findDistinctStores()
        .filter { mask == null || it.contains(mask, ignoreCase = true) }

    /**
     * Fills [PricingOrder.rate] (USD per one unit of the order currency) and [PricingOrder.priceUsd]
     * (USD price normalized to [com.evgenltd.financemanager.pricing.entity.PricingItem.defaultQuantity])
     * for every order that has no rate yet.
     *
     * Rates come from the weekly exchange rate history (keyed by Monday). Weeks with missing rates
     * are requested from the providers asynchronously by [ExchangeRateService.historyRates]; such
     * orders stay without a rate and are picked up again on the next run.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    fun updateUsdPrice() {
        val orders = pricingOrderRepository.findByRateIsNull()
        if (orders.isEmpty()) {
            return
        }

        val rates = orders.filter { it.price.currency != BASE_CURRENCY }
            .groupBy({ it.date.withMonday() }, { it.price.currency })
            .mapValues { (week, currencies) ->
                exchangeRateService.historyRates(Range(week, week.plusWeeks(1)), currencies.distinct())[week]
                    ?: emptyMap()
            }

        val updated = orders.filter { order ->
            val rate = order.usdRate(rates) ?: return@filter false
            val priceUsd = order.priceUsdForDefaultQuantity(rate) ?: return@filter false
            order.rate = rate
            order.priceUsd = priceUsd
            true
        }

        pricingOrderRepository.saveAll(updated)
        log.info("USD price updated for ${updated.size} of ${orders.size} pricing orders")
    }

    private fun PricingOrder.usdRate(rates: Map<LocalDate, Map<String, BigDecimal>>): BigDecimal? {
        if (price.currency == BASE_CURRENCY) {
            return BigDecimal.ONE
        }

        // history rate is the amount of the currency per one unit of BASE_CURRENCY
        return rates[date.withMonday()]
            ?.get(price.currency)
            ?.takeIf { it.signum() > 0 }
            ?.oppositeRate()
    }

    private fun PricingOrder.priceUsdForDefaultQuantity(rate: BigDecimal): Amount? {
        if (quantity.signum() <= 0 || item.defaultQuantity.signum() <= 0) {
            return null
        }

        return price.toBigDecimal()
            .multiply(rate)
            .multiply(item.defaultQuantity)
            .divide(quantity, MathContext.DECIMAL64)
            .setScale(Amount.SCALE, RoundingMode.HALF_UP)
            .fromFractional(BASE_CURRENCY)
    }

}

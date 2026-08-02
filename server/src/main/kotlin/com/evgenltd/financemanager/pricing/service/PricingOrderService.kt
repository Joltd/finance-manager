package com.evgenltd.financemanager.pricing.service

import com.evgenltd.financemanager.common.record.EntityPageResponse
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.between
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.itemEq
import com.evgenltd.financemanager.common.service.until
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
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

@Service
class PricingOrderService(
    private val pricingOrderRepository: PricingOrderRepository,
    private val pricingOrderConverter: PricingOrderConverter,
    private val settingService: SettingService,
) {

    fun loadDefaults(): PricingOrderDefaults {
        val defaultCurrency = settingService.operationDefaultCurrency()
        val lastOrder = pricingOrderRepository.findFirstByOrderByCreatedAtDesc()
        return PricingOrderDefaults(
            date = lastOrder?.date ?: LocalDate.now(),
            currency = defaultCurrency,
            country = lastOrder?.country ?: "",
            city = lastOrder?.city ?: "",
            store = lastOrder?.store ?: "",
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

//    @Scheduled(cron = "0 0 * * * *")
    // Re-enabling this requires re-adding `private val exchangeRateService: ExchangeRateService`
    // to the constructor (removed since it became otherwise unused).
    @Transactional
    fun updateUsdPrice() {
//        val orders = pricingOrderRepository.findByRateIsNull()
//        val rateIndex = orders.map { it.date.with(DayOfWeek.MONDAY) to it.price.currency }
//            .distinct()
//            .associateWith { exchangeRateService.rate(it.first, it.second, "USD") }
//
//        for (order in orders) {
//            val priceForDefaultUnit = order.item.defaultQuantity / order.quantity * order.price.toBigDecimal()
//            val rateResult = rateIndex[order.date.with(DayOfWeek.MONDAY) to order.price.currency] ?: continue
//            if (rateResult.worst) {
//                continue
//            }
//            order.rate = rateResult.rate
//            order.priceUsd = (priceForDefaultUnit * rateResult.rate).fromFractional("USD")
//        }
//
//        pricingOrderRepository.saveAll(orders)
    }

}

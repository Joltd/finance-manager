package com.evgenltd.financemanager.pricing.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.fromFractional
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.record.PricingOrderDefaults
import com.evgenltd.financemanager.pricing.record.PricingOrderRecord
import com.evgenltd.financemanager.pricing.repository.PricingOrderRepository
import com.evgenltd.financemanager.settings.service.SettingService
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime

@Service
class PricingOrderService(
    private val pricingOrderRepository: PricingOrderRepository,
    private val pricingItemService: PricingItemService,
    private val exchangeRateService: ExchangeRateService,
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

    @Transactional
    fun createOrder(record: PricingOrderRecord) {
        val item = pricingItemService.save(record.item)
        val pricingOrder = PricingOrder(
            id = null,
            date = record.date,
            item = item,
            price = record.price,
            quantity = record.quantity,
            rate = null,
            priceUsd = Amount(0, "USD"),
            country = record.country,
            city = record.city,
            store = record.store,
            comment = record.comment,
            createdAt = LocalDateTime.now(),
        )
        pricingOrderRepository.save(pricingOrder)
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    fun updateUsdPrice() {
        val orders = pricingOrderRepository.findByRateIsNull()
        val rateIndex = orders.map { it.price.currency }
            .distinct()
            .associateWith { exchangeRateService.actualRate(it, "USD") }

        for (order in orders) {
            val priceForDefaultUnit = order.item.defaultQuantity / order.quantity * order.price.toBigDecimal()
            val rate = rateIndex[order.price.currency]!!
            order.priceUsd = (priceForDefaultUnit * rate).fromFractional("USD")
        }

        pricingOrderRepository.saveAll(orders)
    }

}
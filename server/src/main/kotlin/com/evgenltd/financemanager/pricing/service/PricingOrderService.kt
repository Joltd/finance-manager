package com.evgenltd.financemanager.pricing.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.fromFractional
import com.evgenltd.financemanager.common.util.fromFractionalString
import com.evgenltd.financemanager.exchangerate.service.ExchangeRateService
import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.record.PricingOrderDefaults
import com.evgenltd.financemanager.pricing.record.PricingOrderRecord
import com.evgenltd.financemanager.pricing.repository.PricingItemRepository
import com.evgenltd.financemanager.pricing.repository.PricingOrderRepository
import com.evgenltd.financemanager.settings.service.SettingService
import jakarta.annotation.PostConstruct
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class PricingOrderService(
    private val pricingItemRepository: PricingItemRepository,
    private val pricingOrderRepository: PricingOrderRepository,
    private val pricingItemService: PricingItemService,
    private val exchangeRateService: ExchangeRateService,
    private val settingService: SettingService,
) {

    @PostConstruct
    fun postConstruct() {
        loadPricingItems()
        loadPricingOrders()
    }

    private fun loadPricingItems() {
        val pricingItemsStream = {}.javaClass.getResourceAsStream("/data/pricing-items.txt")
        if (pricingItemsStream == null) {
            return
        }

        val pricingItemIndex = pricingItemRepository.findAll()
            .associateBy { it.name }

        pricingItemsStream.bufferedReader()
            .use { it.readLines() }
            .map {
                val fields = it.split(",")
                if (fields.size != 4) {
                    throw IllegalArgumentException("Invalid line: $it")
                }
                PricingItem(
                    id = null,
                    name = fields[0],
                    category = fields[1],
                    unit = fields[2],
                    defaultQuantity = fields[3].toBigDecimal(),
                )
            }
            .filter { it.name !in pricingItemIndex }
            .onEach { pricingItemRepository.save(it) }
    }

    private fun loadPricingOrders() {
        val pricingOrdersStream = {}.javaClass.getResourceAsStream("/data/pricing-orders.txt")
        if (pricingOrdersStream == null) {
            return
        }

        val pricingItemIndex = pricingItemRepository.findAll()
            .associateBy { it.name }

        val existedPricingOrders = pricingOrderRepository.findAll()
            .map { it.asString() }
            .toSet()

        pricingOrdersStream.bufferedReader()
            .use { it.readLines() }
            .map {
                val fields = it.split("\t")
                if (fields.size != 8) {
                    throw IllegalArgumentException("Invalid line: $it")
                }

                val itemName = fields[0]
                val item = pricingItemIndex[itemName]
                if (item == null) {
                    throw IllegalArgumentException("Unknown item: $itemName")
                }

                val country = fields[1]
                val currency = when (country) {
                    "Россия" -> "RUB"
                    "Грузия" -> "GEL"
                    "Швеция" -> "SEK"
                    else -> throw IllegalArgumentException("Unknown country: $country")
                }
                val quantity = try {
                    fields[5].toBigDecimal()
                } catch (e: NumberFormatException) {
                    throw IllegalArgumentException("Invalid quantity: ${fields[5]}")
                }
                val date = LocalDate.parse(fields[7], DateTimeFormatter.ofPattern("dd.MM.yyyy"))
                PricingOrder(
                    id = null,
                    date = date,
                    item = item,
                    price = fromFractionalString(fields[6], currency),
                    quantity = quantity,
                    rate = null,
                    priceUsd = Amount(0, "USD"),
                    country = country,
                    city = fields[2],
                    store = fields[4],
                    comment = fields[3],
                    createdAt = LocalDateTime.now(),
                )
            }
            .filter { it.asString() !in existedPricingOrders }
            .onEach { pricingOrderRepository.save(it) }
    }

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
        val rateIndex = orders.map { it.date.with(DayOfWeek.MONDAY) to it.price.currency }
            .distinct()
            .associateWith { exchangeRateService.rate(it.first, it.second, "USD") }

        for (order in orders) {
            val priceForDefaultUnit = order.item.defaultQuantity / order.quantity * order.price.toBigDecimal()
            val rate = rateIndex[order.date.with(DayOfWeek.MONDAY) to order.price.currency]!!
            order.rate = rate
            order.priceUsd = (priceForDefaultUnit * rate).fromFractional("USD")
        }

        pricingOrderRepository.saveAll(orders)
    }

}
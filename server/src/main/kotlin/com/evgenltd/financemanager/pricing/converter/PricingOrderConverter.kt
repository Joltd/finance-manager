package com.evgenltd.financemanager.pricing.converter

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.badRequestException
import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.record.PricingOrderRecord
import com.evgenltd.financemanager.pricing.repository.PricingItemRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class PricingOrderConverter(
    private val pricingItemConverter: PricingItemConverter,
    private val pricingItemRepository: PricingItemRepository,
) {

    fun toRecord(entity: PricingOrder): PricingOrderRecord = PricingOrderRecord(
        id = entity.id,
        date = entity.date,
        item = pricingItemConverter.toRecord(entity.item),
        price = entity.price,
        quantity = entity.quantity,
        rate = entity.rate,
        priceUsd = entity.priceUsd,
        country = entity.country,
        city = entity.city,
        store = entity.store,
        comment = entity.comment,
    )

    fun fillEntity(entity: PricingOrder?, record: PricingOrderRecord): PricingOrder {
        val item = pricingItemRepository.find(record.item.id ?: throw badRequestException("Item is required"))

        return entity?.also {
            it.date = record.date
            it.item = item
            it.price = record.price
            it.quantity = record.quantity
            it.country = record.country
            it.city = record.city
            it.store = record.store
            it.comment = record.comment
        } ?: PricingOrder(
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
    }

}

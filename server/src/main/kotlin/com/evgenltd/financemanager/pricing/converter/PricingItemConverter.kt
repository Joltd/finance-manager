package com.evgenltd.financemanager.pricing.converter

import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.record.PricingItemRecord
import org.springframework.stereotype.Service

@Service
class PricingItemConverter {

    fun toRecord(entity: PricingItem): PricingItemRecord = PricingItemRecord(
        id = entity.id,
        name = entity.name,
        category = entity.category,
        unit = entity.unit,
        defaultQuantity = entity.defaultQuantity,
    )

    @Deprecated("rewrite as fillEntity")
    fun toEntity(record: PricingItemRecord): PricingItem = PricingItem(
        id = record.id,
        name = record.name,
        category = record.category,
        unit = record.unit,
        defaultQuantity = record.defaultQuantity,
    )

}
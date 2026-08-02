package com.evgenltd.financemanager.pricing.converter

import com.evgenltd.financemanager.common.record.Reference
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

    fun fillEntity(entity: PricingItem?, record: PricingItemRecord): PricingItem =
        entity?.also {
            it.name = record.name
            it.category = record.category
            it.unit = record.unit
            it.defaultQuantity = record.defaultQuantity
        } ?: PricingItem(
            id = null,
            name = record.name,
            category = record.category,
            unit = record.unit,
            defaultQuantity = record.defaultQuantity,
        )

    fun toReference(entity: PricingItem): Reference = Reference(id = entity.id!!, name = entity.name)

}

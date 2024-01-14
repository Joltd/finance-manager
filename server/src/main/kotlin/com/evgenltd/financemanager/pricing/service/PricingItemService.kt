package com.evgenltd.financemanager.pricing.service

import com.evgenltd.financemanager.pricing.converter.PricingItemConverter
import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.record.PricingItemRecord
import com.evgenltd.financemanager.pricing.repository.PricingItemRepository
import org.springframework.stereotype.Service

@Service
class PricingItemService(
    private val pricingItemRepository: PricingItemRepository,
    private val pricingItemConverter: PricingItemConverter,
) {

    fun searchTop(query: String): List<PricingItemRecord> =
        pricingItemRepository.findTop5ByNameLikeIgnoreCaseOrderByName("%${query}%")
            .map { pricingItemConverter.toRecord(it) }

    fun save(record: PricingItemRecord): PricingItem {
        val pricingItem = pricingItemConverter.toEntity(record)
        return if (pricingItem.id == null) {
            pricingItemRepository.save(pricingItem)
        } else {
            pricingItem
        }
    }

}
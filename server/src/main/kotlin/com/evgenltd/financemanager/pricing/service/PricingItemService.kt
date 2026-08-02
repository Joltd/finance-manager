package com.evgenltd.financemanager.pricing.service

import com.evgenltd.financemanager.common.record.EntityPageResponse
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.contains
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.like
import com.evgenltd.financemanager.pricing.converter.PricingItemConverter
import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.record.PricingItemFilter
import com.evgenltd.financemanager.pricing.record.PricingItemRecord
import com.evgenltd.financemanager.pricing.repository.PricingItemRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class PricingItemService(
    private val pricingItemRepository: PricingItemRepository,
    private val pricingItemConverter: PricingItemConverter,
) {

    fun searchTop(query: String): List<PricingItemRecord> =
        pricingItemRepository.findTop5ByNameLikeIgnoreCaseOrderByName("%${query}%")
            .map { pricingItemConverter.toRecord(it) }

    fun list(filter: PricingItemFilter): EntityPageResponse<PricingItemRecord> {
        val spec = (PricingItem::name like filter.name) and
            (PricingItem::category eq filter.category) and
            (PricingItem::unit eq filter.unit)
        val page = pricingItemRepository.findAll(spec, PageRequest.of(filter.page, filter.size, Sort.by(PricingItem::name.name)))
        return EntityPageResponse(
            page = filter.page,
            size = filter.size,
            records = page.content.map { pricingItemConverter.toRecord(it) },
            total = page.totalElements,
        )
    }

    fun byId(id: UUID): PricingItemRecord = pricingItemRepository.find(id).let { pricingItemConverter.toRecord(it) }

    @Transactional
    fun update(record: PricingItemRecord): PricingItemRecord = record.id
        ?.let { pricingItemRepository.findByIdOrNull(it) }
        .let { pricingItemConverter.fillEntity(it, record) }
        .let { pricingItemRepository.save(it) }
        .let { pricingItemConverter.toRecord(it) }

    fun delete(id: UUID) = pricingItemRepository.deleteById(id)

    fun listReference(mask: String?, ids: List<UUID>? = null): List<Reference> {
        val spec = (PricingItem::name like mask) and (PricingItem::id contains ids)
        return pricingItemRepository.findAll(spec, Sort.by(PricingItem::name.name))
            .map { pricingItemConverter.toReference(it) }
    }

    fun listDistinctCategories(mask: String?): List<String> = pricingItemRepository.findDistinctCategories()
        .filter { mask == null || it.contains(mask, ignoreCase = true) }

    fun listDistinctUnits(mask: String?): List<String> = pricingItemRepository.findDistinctUnits()
        .filter { mask == null || it.contains(mask, ignoreCase = true) }

}

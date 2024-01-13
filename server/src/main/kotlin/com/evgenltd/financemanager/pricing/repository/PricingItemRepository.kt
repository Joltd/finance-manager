package com.evgenltd.financemanager.pricing.repository

import com.evgenltd.financemanager.pricing.entity.PricingItem
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface PricingItemRepository : JpaRepository<PricingItem, UUID> {

    fun findTop5ByNameLikeIgnoreCaseOrderByName(query: String): List<PricingItem>

}
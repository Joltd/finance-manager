package com.evgenltd.financemanager.pricing.repository

import com.evgenltd.financemanager.pricing.entity.PricingItem
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface PricingItemRepository : JpaRepository<PricingItem, UUID>, JpaSpecificationExecutor<PricingItem> {

    fun findTop5ByNameLikeIgnoreCaseOrderByName(query: String): List<PricingItem>

    @Query("select distinct pi.category from PricingItem pi order by pi.category")
    fun findDistinctCategories(): List<String>

    @Query("select distinct pi.unit from PricingItem pi order by pi.unit")
    fun findDistinctUnits(): List<String>

}

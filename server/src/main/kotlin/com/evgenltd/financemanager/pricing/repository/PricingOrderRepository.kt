package com.evgenltd.financemanager.pricing.repository

import com.evgenltd.financemanager.pricing.entity.PricingOrder
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface PricingOrderRepository : JpaRepository<PricingOrder, UUID>, JpaSpecificationExecutor<PricingOrder> {

    fun findByRateIsNull(): List<PricingOrder>

    fun findFirstByOrderByCreatedAtDesc(): PricingOrder?

    @Query("select distinct po.country from PricingOrder po order by po.country")
    fun findDistinctCountries(): List<String>

    @Query("select distinct po.city from PricingOrder po order by po.city")
    fun findDistinctCities(): List<String>

    @Query("select distinct po.store from PricingOrder po order by po.store")
    fun findDistinctStores(): List<String>

}

package com.evgenltd.financemanager.pricing.repository

import com.evgenltd.financemanager.pricing.entity.PricingOrder
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface PricingOrderRepository : JpaRepository<PricingOrder, UUID> {

    fun findByRateIsNull(): List<PricingOrder>

    fun findFirstByOrderByDateDesc(): PricingOrder?

}
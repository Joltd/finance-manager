package com.evgenltd.financemanager.pricing.repository

import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.entity.PricingSurvey
import com.evgenltd.financemanager.pricing.record.PricingSurveyStats
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface PricingOrderRepository : JpaRepository<PricingOrder, UUID>, JpaSpecificationExecutor<PricingOrder> {

    fun findByRateIsNull(): List<PricingOrder>

    fun findFirstByOrderByCreatedAtDesc(): PricingOrder?

    fun findFirstBySurveyOrderByCreatedAtDesc(survey: PricingSurvey): PricingOrder?

    fun findBySurveyOrderByCreatedAt(survey: PricingSurvey): List<PricingOrder>

    @Query("""
        select new com.evgenltd.financemanager.pricing.record.PricingSurveyStats(
            po.survey.id, min(po.date), max(po.date), count(distinct po.item.id)
        )
        from PricingOrder po
        where po.survey is not null
        group by po.survey.id
    """)
    fun findSurveyStats(): List<PricingSurveyStats>

    @Query("select distinct po.country from PricingOrder po order by po.country")
    fun findDistinctCountries(): List<String>

    @Query("select distinct po.city from PricingOrder po order by po.city")
    fun findDistinctCities(): List<String>

    @Query("select distinct po.store from PricingOrder po order by po.store")
    fun findDistinctStores(): List<String>

}

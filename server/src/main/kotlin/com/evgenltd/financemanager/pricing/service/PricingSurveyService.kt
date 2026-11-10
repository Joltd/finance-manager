package com.evgenltd.financemanager.pricing.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.pricing.converter.PricingItemConverter
import com.evgenltd.financemanager.pricing.converter.PricingSurveyConverter
import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.entity.PricingSurvey
import com.evgenltd.financemanager.pricing.record.PricingSurveyCategoryProgress
import com.evgenltd.financemanager.pricing.record.PricingSurveyItemProgress
import com.evgenltd.financemanager.pricing.record.PricingSurveyProgress
import com.evgenltd.financemanager.pricing.record.PricingSurveyRecord
import com.evgenltd.financemanager.pricing.record.PricingSurveySummary
import com.evgenltd.financemanager.pricing.repository.PricingItemRepository
import com.evgenltd.financemanager.pricing.repository.PricingOrderRepository
import com.evgenltd.financemanager.pricing.repository.PricingSurveyRepository
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class PricingSurveyService(
    private val pricingSurveyRepository: PricingSurveyRepository,
    private val pricingSurveyConverter: PricingSurveyConverter,
    private val pricingItemRepository: PricingItemRepository,
    private val pricingItemConverter: PricingItemConverter,
    private val pricingOrderRepository: PricingOrderRepository,
) {

    fun list(): List<PricingSurveySummary> {
        val total = pricingItemRepository.count().toInt()
        val statsIndex = pricingOrderRepository.findSurveyStats()
            .associateBy { it.surveyId }
        val sort = Sort.by(PricingSurvey::createdAt.name).descending()
        return pricingSurveyRepository.findAll(sort)
            .map { pricingSurveyConverter.toSummary(it, statsIndex[it.id], total) }
    }

    fun byId(id: UUID): PricingSurveyRecord = pricingSurveyRepository.find(id)
        .let { pricingSurveyConverter.toRecord(it) }

    fun progress(id: UUID): PricingSurveyProgress {
        val survey = pricingSurveyRepository.find(id)
        val orders = pricingOrderRepository.findBySurveyOrderByCreatedAt(survey)
        val lastOrderIndex = orders.associateBy { it.item.id }
        val sort = Sort.by(PricingItem::category.name, PricingItem::name.name)
        val categories = pricingItemRepository.findAll(sort)
            .groupBy { it.category }
            .map { (category, items) ->
                PricingSurveyCategoryProgress(
                    category = category,
                    filled = items.count { it.id in lastOrderIndex },
                    total = items.size,
                    items = items.map {
                        PricingSurveyItemProgress(
                            item = pricingItemConverter.toRecord(it),
                            filled = it.id in lastOrderIndex,
                            price = lastOrderIndex[it.id]?.price,
                        )
                    },
                )
            }
        return PricingSurveyProgress(
            survey = pricingSurveyConverter.toRecord(survey),
            dateFrom = orders.minOfOrNull { it.date },
            dateTo = orders.maxOfOrNull { it.date },
            filled = categories.sumOf { it.filled },
            total = categories.sumOf { it.total },
            categories = categories,
        )
    }

    @Transactional
    fun update(record: PricingSurveyRecord): PricingSurveyRecord = record.id
        ?.let { pricingSurveyRepository.findByIdOrNull(it) }
        .let { pricingSurveyConverter.fillEntity(it, record) }
        .let { pricingSurveyRepository.save(it) }
        .also { syncOrders(it) }
        .let { pricingSurveyConverter.toRecord(it) }

    @Transactional
    fun delete(id: UUID) {
        val survey = pricingSurveyRepository.find(id)
        pricingOrderRepository.findBySurveyOrderByCreatedAt(survey)
            .onEach { it.survey = null }
            .let { pricingOrderRepository.saveAll(it) }
        pricingSurveyRepository.delete(survey)
    }

    private fun syncOrders(survey: PricingSurvey) {
        pricingOrderRepository.findBySurveyOrderByCreatedAt(survey)
            .filter { it.country != survey.country || it.city != survey.city }
            .onEach {
                it.country = survey.country
                it.city = survey.city
            }
            .let { pricingOrderRepository.saveAll(it) }
    }

}

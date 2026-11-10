package com.evgenltd.financemanager.pricing.record

import com.evgenltd.financemanager.common.util.Amount
import java.time.LocalDate
import java.util.UUID

data class PricingSurveyRecord(
    val id: UUID?,
    val country: String,
    val city: String,
    val currency: String,
)

data class PricingSurveySummary(
    val survey: PricingSurveyRecord,
    val dateFrom: LocalDate?,
    val dateTo: LocalDate?,
    val filled: Int,
    val total: Int,
)

data class PricingSurveyProgress(
    val survey: PricingSurveyRecord,
    val dateFrom: LocalDate?,
    val dateTo: LocalDate?,
    val filled: Int,
    val total: Int,
    val categories: List<PricingSurveyCategoryProgress>,
)

data class PricingSurveyCategoryProgress(
    val category: String,
    val filled: Int,
    val total: Int,
    val items: List<PricingSurveyItemProgress>,
)

data class PricingSurveyItemProgress(
    val item: PricingItemRecord,
    val filled: Boolean,
    val price: Amount?,
)

data class PricingSurveyStats(
    val surveyId: UUID,
    val dateFrom: LocalDate,
    val dateTo: LocalDate,
    val filled: Long,
)

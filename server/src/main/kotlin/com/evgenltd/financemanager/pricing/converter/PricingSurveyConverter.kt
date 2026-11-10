package com.evgenltd.financemanager.pricing.converter

import com.evgenltd.financemanager.pricing.entity.PricingSurvey
import com.evgenltd.financemanager.pricing.record.PricingSurveyRecord
import com.evgenltd.financemanager.pricing.record.PricingSurveyStats
import com.evgenltd.financemanager.pricing.record.PricingSurveySummary
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class PricingSurveyConverter {

    fun toRecord(entity: PricingSurvey): PricingSurveyRecord = PricingSurveyRecord(
        id = entity.id,
        country = entity.country,
        city = entity.city,
        currency = entity.currency,
    )

    fun toSummary(entity: PricingSurvey, stats: PricingSurveyStats?, total: Int): PricingSurveySummary = PricingSurveySummary(
        survey = toRecord(entity),
        dateFrom = stats?.dateFrom,
        dateTo = stats?.dateTo,
        filled = stats?.filled?.toInt() ?: 0,
        total = total,
    )

    fun fillEntity(entity: PricingSurvey?, record: PricingSurveyRecord): PricingSurvey =
        entity?.also {
            it.country = record.country
            it.city = record.city
            it.currency = record.currency
        } ?: PricingSurvey(
            id = null,
            country = record.country,
            city = record.city,
            currency = record.currency,
            createdAt = LocalDateTime.now(),
        )

}

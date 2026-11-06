package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.util.Amount
import java.math.BigDecimal

data class PricingComparisonFilter(
    val slices: List<PricingComparisonSlice> = emptyList(),
)

data class PricingComparisonSlice(
    val date: DateRange? = null,
    val country: String? = null,
    val city: String? = null,
    val store: String? = null,
)

/**
 * [columns] keep the order of the requested slices, the first one is the base.
 * Every [PricingComparisonCategoryRecord.values] list is aligned with [columns].
 * Empty [categories] means there are no items priced in every non-empty slice.
 */
data class PricingComparisonReportRecord(
    val columns: List<PricingComparisonColumnRecord> = emptyList(),
    val categories: List<PricingComparisonCategoryRecord> = emptyList(),
)

data class PricingComparisonColumnRecord(
    val slice: PricingComparisonSlice,
    val empty: Boolean,
    val total: PricingComparisonValueRecord,
)

data class PricingComparisonCategoryRecord(
    val category: String,
    val values: List<PricingComparisonValueRecord>,
)

/**
 * [deviation] is a percentage relative to the base slice, `null` when the base value is missing or zero.
 */
data class PricingComparisonValueRecord(
    val amount: Amount? = null,
    val deviation: BigDecimal? = null,
)

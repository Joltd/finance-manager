package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.gte
import com.evgenltd.financemanager.common.repository.lte
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.badRequestException
import com.evgenltd.financemanager.common.util.fromFractional
import com.evgenltd.financemanager.exchangerate.entity.BASE_CURRENCY
import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.repository.PricingOrderRepository
import com.evgenltd.financemanager.report.record.PricingComparisonCategoryRecord
import com.evgenltd.financemanager.report.record.PricingComparisonColumnRecord
import com.evgenltd.financemanager.report.record.PricingComparisonFilter
import com.evgenltd.financemanager.report.record.PricingComparisonReportRecord
import com.evgenltd.financemanager.report.record.PricingComparisonSlice
import com.evgenltd.financemanager.report.record.PricingComparisonValueRecord
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.MathContext
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

/**
 * Compares typical prices of pricing items between arbitrary slices (date range + optional geography).
 *
 * Typical item price inside a slice: per calendar month — median of observations per store,
 * median of stores per city, mean of cities; then mean of the months where the item was observed.
 * Only items priced in every non-empty slice are summed up into categories.
 */
@Service
class PricingComparisonReportService(
    private val pricingOrderRepository: PricingOrderRepository,
) {

    @Transactional(readOnly = true)
    fun report(filter: PricingComparisonFilter): PricingComparisonReportRecord {
        val slices = validate(filter)
        val itemPrices = slices.map { slice -> loadObservations(slice).let { calculateItemPrices(it) } }
        return buildReport(slices, itemPrices)
    }

    private fun validate(filter: PricingComparisonFilter): List<ValidSlice> {
        if (filter.slices.isEmpty()) {
            throw badRequestException("At least one slice is required")
        }
        if (filter.slices.size > MAX_SLICES) {
            throw badRequestException("No more than $MAX_SLICES slices are allowed")
        }

        return filter.slices.mapIndexed { index, slice ->
            val from = slice.date?.from ?: throw badRequestException("Slice ${index + 1}: date from is required")
            val to = slice.date.to ?: throw badRequestException("Slice ${index + 1}: date to is required")
            if (from > to) {
                throw badRequestException("Slice ${index + 1}: date from must not be after date to")
            }
            ValidSlice(
                from = from,
                to = to,
                country = slice.country.normalizeGeo(),
                city = slice.city.normalizeGeo(),
                store = slice.store.normalizeGeo(),
            )
        }
    }

    private fun String?.normalizeGeo(): String? = this?.trim()?.takeIf { it.isNotEmpty() }

    private fun loadObservations(slice: ValidSlice): List<Observation> =
        ((PricingOrder::date gte slice.from) and
            (PricingOrder::date lte slice.to) and
            (PricingOrder::country eq slice.country) and
            (PricingOrder::city eq slice.city) and
            (PricingOrder::store eq slice.store))
            .let { pricingOrderRepository.findAll(it) }
            .filter { it.isValidObservation() }
            .map {
                Observation(
                    itemId = it.item.id!!,
                    category = it.item.category,
                    month = YearMonth.from(it.date),
                    city = CityKey(it.country, it.city),
                    store = it.store,
                    price = it.priceUsd.toBigDecimal(),
                )
            }

    // priceUsd is already normalized to the item default quantity by the background job
    private fun PricingOrder.isValidObservation(): Boolean = rate != null &&
        priceUsd.currency == BASE_CURRENCY &&
        priceUsd.value > 0 &&
        quantity.signum() > 0 &&
        item.defaultQuantity.signum() > 0

    private fun calculateItemPrices(observations: List<Observation>): Map<UUID, ItemPrice> = observations
        .groupBy { it.itemId }
        .mapValues { (_, itemObservations) ->
            val monthlyPrices = itemObservations
                .groupBy { it.month }
                .values
                .map { monthObservations ->
                    monthObservations
                        .groupBy { it.city }
                        .values
                        .map { cityObservations ->
                            cityObservations
                                .groupBy { it.store }
                                .values
                                .map { storeObservations -> storeObservations.map { it.price }.median() }
                                .median()
                        }
                        .mean()
                }
            ItemPrice(category = itemObservations.first().category, price = monthlyPrices.mean())
        }

    private fun buildReport(slices: List<ValidSlice>, itemPrices: List<Map<UUID, ItemPrice>>): PricingComparisonReportRecord {
        val commonItems = itemPrices
            .filter { it.isNotEmpty() }
            .map { it.keys }
            .reduceOrNull { acc, keys -> acc intersect keys }
            ?: emptySet()

        val categories = commonItems
            .map { itemId -> itemPrices.first { it.isNotEmpty() }.getValue(itemId).category }
            .distinct()
            .sortedWith(String.CASE_INSENSITIVE_ORDER.thenBy { it })

        // per slice: category -> sum, null for slices without data
        val categorySums: List<Map<String, BigDecimal>?> = itemPrices.map { prices ->
            if (prices.isEmpty() || commonItems.isEmpty()) {
                null
            } else {
                commonItems
                    .map { prices.getValue(it) }
                    .groupBy { it.category }
                    .mapValues { (_, items) -> items.sumOf { it.price } }
            }
        }
        val totals: List<BigDecimal?> = categorySums.map { sums -> sums?.values?.sumOf { it } }

        val baseSums = categorySums.first()
        val baseTotal = totals.first()

        return PricingComparisonReportRecord(
            columns = slices.mapIndexed { index, slice ->
                PricingComparisonColumnRecord(
                    slice = slice.toRecord(),
                    empty = itemPrices[index].isEmpty(),
                    total = valueRecord(totals[index], baseTotal),
                )
            },
            categories = categories.map { category ->
                PricingComparisonCategoryRecord(
                    category = category,
                    values = categorySums.map { sums -> valueRecord(sums?.get(category), baseSums?.get(category)) },
                )
            },
        )
    }

    private fun valueRecord(value: BigDecimal?, base: BigDecimal?): PricingComparisonValueRecord =
        PricingComparisonValueRecord(
            amount = value?.toUsdAmount(),
            deviation = deviation(value, base),
        )

    private fun deviation(value: BigDecimal?, base: BigDecimal?): BigDecimal? {
        if (value == null || base == null || base.signum() == 0) {
            return null
        }
        return value.divide(base, MATH_CONTEXT)
            .subtract(BigDecimal.ONE)
            .multiply(HUNDRED)
    }

    private fun BigDecimal.toUsdAmount(): Amount = setScale(Amount.SCALE, RoundingMode.HALF_UP).fromFractional(BASE_CURRENCY)

    private fun List<BigDecimal>.median(): BigDecimal {
        val sorted = sorted()
        val middle = sorted.size / 2
        return if (sorted.size % 2 == 1) {
            sorted[middle]
        } else {
            sorted[middle - 1].add(sorted[middle]).divide(TWO, MATH_CONTEXT)
        }
    }

    private fun List<BigDecimal>.mean(): BigDecimal = sumOf { it }.divide(size.toBigDecimal(), MATH_CONTEXT)

    private fun ValidSlice.toRecord(): PricingComparisonSlice = PricingComparisonSlice(
        date = DateRange(from, to),
        country = country,
        city = city,
        store = store,
    )

    private data class ValidSlice(
        val from: LocalDate,
        val to: LocalDate,
        val country: String?,
        val city: String?,
        val store: String?,
    )

    private data class CityKey(val country: String, val city: String)

    private data class Observation(
        val itemId: UUID,
        val category: String,
        val month: YearMonth,
        val city: CityKey,
        val store: String,
        val price: BigDecimal,
    )

    private data class ItemPrice(val category: String, val price: BigDecimal)

    private companion object {
        const val MAX_SLICES = 5
        val MATH_CONTEXT: MathContext = MathContext.DECIMAL64
        val TWO: BigDecimal = BigDecimal.valueOf(2)
        val HUNDRED: BigDecimal = BigDecimal.valueOf(100)
    }

}

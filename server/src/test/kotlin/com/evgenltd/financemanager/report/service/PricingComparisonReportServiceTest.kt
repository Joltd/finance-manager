package com.evgenltd.financemanager.report.service

import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.fromFractionalString
import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.repository.PricingOrderRepository
import com.evgenltd.financemanager.report.record.PricingComparisonFilter
import com.evgenltd.financemanager.report.record.PricingComparisonSlice
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.data.jpa.domain.Specification
import org.springframework.web.server.ResponseStatusException
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

class PricingComparisonReportServiceTest {

    private val pricingOrderRepository = mock<PricingOrderRepository>()
    private val service = PricingComparisonReportService(pricingOrderRepository)

    private val milk = item("Milk", "Dairy")
    private val cheese = item("Cheese", "Dairy")
    private val bread = item("Bread", "Bakery")

    private fun item(name: String, category: String) = PricingItem(
        id = UUID.randomUUID(),
        name = name,
        category = category,
        unit = "pcs",
        defaultQuantity = BigDecimal.ONE,
    )

    private fun order(
        item: PricingItem,
        priceUsd: String,
        date: LocalDate = LocalDate.of(2026, 1, 15),
        city: String = "Budva",
        store: String = "Voli",
        country: String = "Montenegro",
        rate: BigDecimal? = BigDecimal.ONE,
        quantity: BigDecimal = BigDecimal.ONE,
    ) = PricingOrder(
        id = UUID.randomUUID(),
        date = date,
        item = item,
        price = fromFractionalString(priceUsd, "EUR"),
        quantity = quantity,
        rate = rate,
        priceUsd = fromFractionalString(priceUsd, "USD"),
        country = country,
        city = city,
        store = store,
        comment = null,
        createdAt = LocalDateTime.now(),
    )

    private fun slice(from: LocalDate = LocalDate.of(2026, 1, 1), to: LocalDate = LocalDate.of(2026, 12, 31)) =
        PricingComparisonSlice(date = DateRange(from, to))

    private fun givenSliceOrders(vararg orders: List<PricingOrder>) {
        val (first, rest) = orders.first() to orders.drop(1)
        whenever(pricingOrderRepository.findAll(any<Specification<PricingOrder>>()))
            .thenReturn(first, *rest.toTypedArray())
    }

    private fun usd(value: String) = fromFractionalString(value, "USD")

    private fun BigDecimal?.rounded(): BigDecimal? = this?.setScale(4, RoundingMode.HALF_UP)

    @Test
    fun `report - takes store median, city median, city mean per month and then the mean of months`() {
        givenSliceOrders(
            listOf(
                // January, Budva: Voli median = 2, Idea median = 4 -> city median = 3
                order(milk, "1", date = LocalDate.of(2026, 1, 5)),
                order(milk, "2", date = LocalDate.of(2026, 1, 10)),
                order(milk, "6", date = LocalDate.of(2026, 1, 20)),
                order(milk, "3", date = LocalDate.of(2026, 1, 5), store = "Idea"),
                order(milk, "5", date = LocalDate.of(2026, 1, 6), store = "Idea"),
                // January, Bar: the same store name in another city is a separate store -> city = 5
                order(milk, "5", date = LocalDate.of(2026, 1, 7), city = "Bar"),
                // February, Budva: a single observation -> 10
                order(milk, "10", date = LocalDate.of(2026, 2, 3)),
            ),
        )

        val report = service.report(PricingComparisonFilter(listOf(slice())))

        // January = mean(3, 5) = 4, February = 10; every month has the same weight -> 7
        assertThat(report.categories).hasSize(1)
        assertThat(report.categories.first().category).isEqualTo("Dairy")
        assertThat(report.categories.first().values.first().amount).isEqualTo(usd("7"))
        assertThat(report.columns.first().total.amount).isEqualTo(usd("7"))
        assertThat(report.columns.first().total.deviation).isEqualByComparingTo("0")
    }

    @Test
    fun `report - compares only items priced in every non-empty slice and keeps an empty slice with no values`() {
        givenSliceOrders(
            listOf(order(milk, "2"), order(cheese, "5"), order(bread, "1")),
            listOf(order(milk, "2.5"), order(bread, "1.5")),
            emptyList(),
        )

        val report = service.report(PricingComparisonFilter(listOf(slice(), slice(), slice())))

        assertThat(report.columns).extracting("empty").containsExactly(false, false, true)
        assertThat(report.categories).extracting("category").containsExactly("Bakery", "Dairy")

        val (bakery, dairy) = report.categories
        // cheese is missing in the second slice, so it's excluded from the base sum too
        assertThat(dairy.values.map { it.amount }).containsExactly(usd("2"), usd("2.5"), null)
        assertThat(dairy.values[1].deviation).isEqualByComparingTo("25")
        assertThat(dairy.values[2].deviation).isNull()
        assertThat(bakery.values.map { it.amount }).containsExactly(usd("1"), usd("1.5"), null)
        assertThat(bakery.values[1].deviation).isEqualByComparingTo("50")

        val totals = report.columns.map { it.total }
        assertThat(totals.map { it.amount }).containsExactly(usd("3"), usd("4"), null)
        assertThat(totals[1].deviation.rounded()).isEqualByComparingTo("33.3333")
        assertThat(totals[2].deviation).isNull()
    }

    @Test
    fun `report - returns no categories when non-empty slices have no common items`() {
        givenSliceOrders(
            listOf(order(milk, "2")),
            listOf(order(bread, "1")),
        )

        val report = service.report(PricingComparisonFilter(listOf(slice(), slice())))

        assertThat(report.categories).isEmpty()
        assertThat(report.columns).extracting("empty").containsExactly(false, false)
        assertThat(report.columns.map { it.total.amount }).containsOnlyNulls()
    }

    @Test
    fun `report - returns null deviations when the base slice is empty`() {
        givenSliceOrders(
            emptyList(),
            listOf(order(milk, "2")),
        )

        val report = service.report(PricingComparisonFilter(listOf(slice(), slice())))

        assertThat(report.categories).hasSize(1)
        assertThat(report.categories.first().values.map { it.amount }).containsExactly(null, usd("2"))
        assertThat(report.categories.first().values.map { it.deviation }).containsOnlyNulls()
        assertThat(report.columns.map { it.total.deviation }).containsOnlyNulls()
    }

    @Test
    fun `report - ignores observations with zero USD price, without a rate or with an invalid quantity`() {
        givenSliceOrders(
            listOf(
                order(milk, "2"),
                order(milk, "0"),
                order(milk, "9", rate = null),
                order(milk, "9", quantity = BigDecimal.ZERO),
            ),
        )

        val report = service.report(PricingComparisonFilter(listOf(slice())))

        assertThat(report.columns.first().total.amount).isEqualTo(usd("2"))
    }

    @Test
    fun `report - marks a slice with only ignored observations as empty`() {
        givenSliceOrders(listOf(order(milk, "0")))

        val report = service.report(PricingComparisonFilter(listOf(slice())))

        assertThat(report.columns.first().empty).isTrue()
        assertThat(report.categories).isEmpty()
    }

    @Test
    fun `report - echoes normalized slices in the request order`() {
        givenSliceOrders(emptyList(), emptyList())
        val first = PricingComparisonSlice(DateRange(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31)), country = "  ", city = " Budva ", store = null)
        val second = PricingComparisonSlice(DateRange(LocalDate.of(2024, 5, 1), LocalDate.of(2024, 5, 1)), country = "Serbia")

        val report = service.report(PricingComparisonFilter(listOf(first, second)))

        assertThat(report.columns.map { it.slice }).containsExactly(
            PricingComparisonSlice(DateRange(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31)), country = null, city = "Budva", store = null),
            second,
        )
    }

    @Test
    fun `report - rejects an empty slice list`() {
        assertThatThrownBy { service.report(PricingComparisonFilter(emptyList())) }
            .isInstanceOf(ResponseStatusException::class.java)
            .hasMessageContaining("At least one slice is required")
    }

    @Test
    fun `report - rejects more than five slices`() {
        assertThatThrownBy { service.report(PricingComparisonFilter(List(6) { slice() })) }
            .isInstanceOf(ResponseStatusException::class.java)
            .hasMessageContaining("No more than 5 slices are allowed")
    }

    @Test
    fun `report - rejects a slice without dates`() {
        val noTo = PricingComparisonSlice(DateRange(LocalDate.of(2026, 1, 1), null))

        assertThatThrownBy { service.report(PricingComparisonFilter(listOf(slice(), noTo))) }
            .isInstanceOf(ResponseStatusException::class.java)
            .hasMessageContaining("Slice 2: date to is required")
    }

    @Test
    fun `report - rejects a slice with from after to`() {
        val reversed = slice(from = LocalDate.of(2026, 2, 1), to = LocalDate.of(2026, 1, 31))

        assertThatThrownBy { service.report(PricingComparisonFilter(listOf(reversed))) }
            .isInstanceOf(ResponseStatusException::class.java)
            .hasMessageContaining("Slice 1: date from must not be after date to")
    }

    @Test
    fun `report - amounts are returned in USD`() {
        givenSliceOrders(listOf(order(milk, "1.23456")))

        val report = service.report(PricingComparisonFilter(listOf(slice())))

        assertThat(report.columns.first().total.amount).isEqualTo(Amount(12345, "USD"))
    }

}

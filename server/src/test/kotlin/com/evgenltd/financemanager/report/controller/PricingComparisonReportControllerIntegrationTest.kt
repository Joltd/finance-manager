package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.common.record.DateRange
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.fromFractionalString
import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.repository.PricingItemRepository
import com.evgenltd.financemanager.pricing.repository.PricingOrderRepository
import com.evgenltd.financemanager.report.record.PricingComparisonFilter
import com.evgenltd.financemanager.report.record.PricingComparisonReportRecord
import com.evgenltd.financemanager.report.record.PricingComparisonSlice
import com.evgenltd.financemanager.testsupport.ApiResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpStatus
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

class PricingComparisonReportControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var pricingItemRepository: PricingItemRepository

    @Autowired
    private lateinit var pricingOrderRepository: PricingOrderRepository

    private lateinit var milk: PricingItem

    @BeforeEach
    fun setUp() {
        pricingOrderRepository.deleteAll()
        pricingItemRepository.deleteAll()
        milk = pricingItemRepository.save(PricingItem(id = null, name = "Milk", category = "Dairy", unit = "L", defaultQuantity = BigDecimal.ONE))
    }

    private fun order(date: LocalDate, priceUsd: String, city: String = "Budva", country: String = "Montenegro") =
        pricingOrderRepository.save(
            PricingOrder(
                id = null,
                date = date,
                item = milk,
                price = fromFractionalString(priceUsd, "USD"),
                quantity = BigDecimal.ONE,
                rate = BigDecimal.ONE,
                priceUsd = fromFractionalString(priceUsd, "USD"),
                country = country,
                city = city,
                store = "Voli",
                comment = null,
                createdAt = LocalDateTime.now(),
            ),
        )

    private fun request(filter: PricingComparisonFilter) = restClient.post()
        .uri("/api/v1/report/pricing-comparison")
        .headers { it.addAll(authHeaders()) }
        .body(filter)

    @Test
    fun `pricingComparisonReport - includes both date bounds and applies geography filters`() {
        order(LocalDate.of(2025, 12, 31), "100") // before the range
        order(LocalDate.of(2026, 1, 1), "2")
        order(LocalDate.of(2026, 1, 31), "2")
        order(LocalDate.of(2026, 2, 1), "100") // after the range
        order(LocalDate.of(2026, 1, 15), "100", city = "Belgrade", country = "Serbia")
        order(LocalDate.of(2024, 5, 10), "3", city = "Belgrade", country = "Serbia")

        val response = request(
            PricingComparisonFilter(
                listOf(
                    PricingComparisonSlice(DateRange(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31)), city = "Budva"),
                    PricingComparisonSlice(DateRange(LocalDate.of(2024, 5, 10), LocalDate.of(2024, 5, 10)), country = "Serbia"),
                ),
            ),
        )
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<PricingComparisonReportRecord>>() {})

        val report = response!!.body!!
        assertThat(report.columns.map { it.slice.city }).containsExactly("Budva", null)
        assertThat(report.columns.map { it.slice.country }).containsExactly(null, "Serbia")
        assertThat(report.categories).extracting("category").containsExactly("Dairy")
        assertThat(report.columns.map { it.total.amount }).containsExactly(Amount(20_000, "USD"), Amount(30_000, "USD"))
        assertThat(report.columns[1].total.deviation).isEqualByComparingTo("50")
    }

    @Test
    fun `pricingComparisonReport - rejects a slice without dates`() {
        val response = request(PricingComparisonFilter(listOf(PricingComparisonSlice(DateRange(null, LocalDate.of(2026, 1, 31))))))
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
    }

}

package com.evgenltd.financemanager.pricing.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.common.record.EntityPageResponse
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.record.PricingItemRecord
import com.evgenltd.financemanager.pricing.record.PricingOrderDefaults
import com.evgenltd.financemanager.pricing.record.PricingOrderRecord
import com.evgenltd.financemanager.pricing.repository.PricingItemRepository
import com.evgenltd.financemanager.pricing.repository.PricingOrderRepository
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

class PricingOrderControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var pricingItemRepository: PricingItemRepository

    @Autowired
    private lateinit var pricingOrderRepository: PricingOrderRepository

    private lateinit var item: PricingItem

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        pricingOrderRepository.deleteAll()
        pricingItemRepository.deleteAll()
        item = pricingItemRepository.save(PricingItem(id = null, name = "Milk", category = "Food", unit = "L", defaultQuantity = BigDecimal.ONE))
    }

    private fun order(country: String, createdAt: LocalDateTime = LocalDateTime.of(2024, 1, 15, 10, 0)) = PricingOrder(
        id = null,
        date = LocalDate.of(2024, 1, 15),
        item = item,
        price = Amount(50_000L, "USD"),
        quantity = BigDecimal.ONE,
        rate = null,
        priceUsd = Amount(0, "USD"),
        country = country,
        city = "Tbilisi",
        store = "Carrefour",
        comment = null,
        createdAt = createdAt,
    )

    @Test
    fun `list - filters by country`() {
        pricingOrderRepository.save(order("Georgia"))
        pricingOrderRepository.save(order("Armenia"))

        val response = restClient.get()
            .uri("/api/v1/pricing/order?country=Georgia")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<EntityPageResponse<PricingOrderRecord>>>() {})

        assertThat(response!!.body!!.records).extracting("country").containsExactly("Georgia")
    }

    @Test
    fun `byId - returns a single order`() {
        val saved = pricingOrderRepository.save(order("Georgia"))

        val response = restClient.get()
            .uri("/api/v1/pricing/order/${saved.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<PricingOrderRecord>>() {})

        assertThat(response!!.body!!.item.name).isEqualTo("Milk")
    }

    @Test
    fun `update - creates a new order for an existing item`() {
        val record = PricingOrderRecord(
            id = null,
            date = LocalDate.of(2024, 1, 15),
            item = PricingItemRecord(id = item.id, name = item.name, category = item.category, unit = item.unit, defaultQuantity = item.defaultQuantity),
            price = Amount(50_000L, "USD"),
            quantity = BigDecimal.ONE,
            country = "Georgia",
            city = "Tbilisi",
            store = "Carrefour",
            comment = null,
        )

        val response = restClient.post()
            .uri("/api/v1/pricing/order")
            .headers { it.addAll(authHeaders()) }
            .body(record)
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(pricingOrderRepository.findAll()).extracting("country").containsExactly("Georgia")
    }

    @Test
    fun `delete - removes the order`() {
        val saved = pricingOrderRepository.save(order("Georgia"))

        val response = restClient.delete()
            .uri("/api/v1/pricing/order/${saved.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(pricingOrderRepository.findById(saved.id!!)).isEmpty()
    }

    @Test
    fun `listCountryReference - filters by mask`() {
        pricingOrderRepository.save(order("Georgia"))
        pricingOrderRepository.save(order("Armenia"))

        val response = restClient.get()
            .uri("/api/v1/pricing/order/country/reference?mask=geo")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<String>>>() {})

        assertThat(response!!.body).containsExactly("Georgia")
    }

    @Test
    fun `loadDefaults - reuses fields from the most recently created order`() {
        pricingOrderRepository.save(order("Georgia", createdAt = LocalDateTime.of(2024, 1, 10, 10, 0)))
        pricingOrderRepository.save(order("Armenia", createdAt = LocalDateTime.of(2024, 1, 20, 10, 0)))

        val response = restClient.get()
            .uri("/api/v1/pricing/order/defaults")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<PricingOrderDefaults>>() {})

        assertThat(response!!.body!!.country).isEqualTo("Armenia")
    }
}

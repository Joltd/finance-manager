package com.evgenltd.financemanager.pricing.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.common.record.EntityPageResponse
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.record.PricingItemRecord
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

class PricingItemControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var pricingItemRepository: PricingItemRepository

    @Autowired
    private lateinit var pricingOrderRepository: PricingOrderRepository

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        pricingOrderRepository.deleteAll() // PricingOrder has an FK to PricingItem
        pricingItemRepository.deleteAll()
    }

    private fun item(name: String) = PricingItem(id = null, name = name, category = "Food", unit = "L", defaultQuantity = BigDecimal.ONE)

    @Test
    fun `search - finds items by case-insensitive substring`() {
        pricingItemRepository.save(item("Whole Milk"))
        pricingItemRepository.save(item("Bread"))

        val response = restClient.get()
            .uri("/api/v1/pricing/item/top?query=milk")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<PricingItemRecord>>>() {})

        assertThat(response!!.body).extracting("name").containsExactly("Whole Milk")
    }

    @Test
    fun `list - filters by category and paginates`() {
        pricingItemRepository.save(item("Milk"))
        pricingItemRepository.save(item("Bread").also { it.category = "Bakery" })

        val response = restClient.get()
            .uri("/api/v1/pricing/item?category=Food")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<EntityPageResponse<PricingItemRecord>>>() {})

        assertThat(response!!.body!!.total).isEqualTo(1)
        assertThat(response.body!!.records).extracting("name").containsExactly("Milk")
    }

    @Test
    fun `byId - returns a single item`() {
        val saved = pricingItemRepository.save(item("Milk"))

        val response = restClient.get()
            .uri("/api/v1/pricing/item/${saved.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<PricingItemRecord>>() {})

        assertThat(response!!.body!!.name).isEqualTo("Milk")
    }

    @Test
    fun `update - creates a new item when the record has no id`() {
        val response = restClient.post()
            .uri("/api/v1/pricing/item")
            .headers { it.addAll(authHeaders()) }
            .body(PricingItemRecord(id = null, name = "Bread", category = "Bakery", unit = "pcs", defaultQuantity = BigDecimal.TEN))
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(pricingItemRepository.findAll()).extracting("name").containsExactly("Bread")
    }

    @Test
    fun `delete - removes the item`() {
        val saved = pricingItemRepository.save(item("Milk"))

        val response = restClient.delete()
            .uri("/api/v1/pricing/item/${saved.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(pricingItemRepository.findById(saved.id!!)).isEmpty()
    }

    @Test
    fun `listReference - filters by name mask`() {
        pricingItemRepository.save(item("Milk"))
        pricingItemRepository.save(item("Bread"))

        val response = restClient.get()
            .uri("/api/v1/pricing/item/reference?mask=mil")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<Reference>>>() {})

        assertThat(response!!.body).extracting("name").containsExactly("Milk")
    }
}

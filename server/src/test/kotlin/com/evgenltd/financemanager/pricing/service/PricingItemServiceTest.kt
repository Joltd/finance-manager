package com.evgenltd.financemanager.pricing.service

import com.evgenltd.financemanager.pricing.converter.PricingItemConverter
import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.record.PricingItemFilter
import com.evgenltd.financemanager.pricing.record.PricingItemRecord
import com.evgenltd.financemanager.pricing.repository.PricingItemRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
import java.math.BigDecimal
import java.util.Optional
import java.util.UUID

class PricingItemServiceTest {

    private val pricingItemRepository = mock<PricingItemRepository>()
    private val service = PricingItemService(pricingItemRepository, PricingItemConverter())

    private fun item(name: String = "Milk") = PricingItem(id = UUID.randomUUID(), name = name, category = "Food", unit = "L", defaultQuantity = BigDecimal.ONE)

    @Test
    fun `searchTop - delegates to the top-5 case-insensitive name search`() {
        val milk = item("Milk")
        whenever(pricingItemRepository.findTop5ByNameLikeIgnoreCaseOrderByName("%milk%")).thenReturn(listOf(milk))

        val result = service.searchTop("milk")

        assertThat(result).extracting("id").containsExactly(milk.id)
    }

    @Test
    fun `list - maps a page of results into an EntityPageResponse`() {
        val milk = item("Milk")
        whenever(pricingItemRepository.findAll(any<Specification<PricingItem>>(), any<Pageable>()))
            .thenReturn(PageImpl(listOf(milk), PageRequest.of(0, 20), 1))

        val result = service.list(PricingItemFilter(page = 0, size = 20))

        assertThat(result.total).isEqualTo(1)
        assertThat(result.records).extracting("id").containsExactly(milk.id)
    }

    @Test
    fun `byId - looks up and converts the item`() {
        val id = UUID.randomUUID()
        whenever(pricingItemRepository.findById(id)).thenReturn(Optional.of(item("Milk").also { it.id = id }))

        assertThat(service.byId(id).name).isEqualTo("Milk")
    }

    @Test
    fun `update - creates a new item when the record has no id`() {
        whenever(pricingItemRepository.save(any<PricingItem>())).thenAnswer { it.arguments[0] as PricingItem }

        val result = service.update(PricingItemRecord(id = null, name = "Bread", category = "Food", unit = "pcs", defaultQuantity = BigDecimal.TEN))

        assertThat(result.name).isEqualTo("Bread")
        assertThat(result.defaultQuantity).isEqualByComparingTo(BigDecimal.TEN)
    }

    @Test
    fun `delete - deletes by id directly`() {
        val id = UUID.randomUUID()

        service.delete(id)

        org.mockito.kotlin.verify(pricingItemRepository).deleteById(id)
    }

    @Test
    fun `listDistinctCategories - filters the distinct categories by mask case-insensitively`() {
        whenever(pricingItemRepository.findDistinctCategories()).thenReturn(listOf("Food", "Transport", "Utilities"))

        assertThat(service.listDistinctCategories("foo")).containsExactly("Food")
        assertThat(service.listDistinctCategories(null)).containsExactly("Food", "Transport", "Utilities")
    }

    @Test
    fun `listDistinctUnits - filters the distinct units by mask case-insensitively`() {
        whenever(pricingItemRepository.findDistinctUnits()).thenReturn(listOf("kg", "L", "pcs"))

        assertThat(service.listDistinctUnits("PC")).containsExactly("pcs")
    }
}

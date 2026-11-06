package com.evgenltd.financemanager.pricing.converter

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.pricing.entity.PricingItem
import com.evgenltd.financemanager.pricing.entity.PricingOrder
import com.evgenltd.financemanager.pricing.repository.PricingItemRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.Optional
import java.util.UUID

class PricingOrderConverterTest {

    private val pricingItemRepository = mock<PricingItemRepository>()
    private val converter = PricingOrderConverter(PricingItemConverter(), pricingItemRepository)

    private val milk = PricingItem(id = UUID.randomUUID(), name = "Milk", category = "Dairy", unit = "L", defaultQuantity = BigDecimal.ONE)

    private fun calculatedOrder() = PricingOrder(
        id = UUID.randomUUID(),
        date = LocalDate.of(2026, 1, 14),
        item = milk,
        price = Amount(20_000, "EUR"),
        quantity = BigDecimal.ONE,
        rate = BigDecimal("1.25"),
        priceUsd = Amount(25_000, "USD"),
        country = "Montenegro",
        city = "Budva",
        store = "Voli",
        comment = null,
        createdAt = LocalDateTime.now(),
    )

    @Test
    fun `fillEntity - resets the USD price when the price changes`() {
        whenever(pricingItemRepository.findById(milk.id!!)).thenReturn(Optional.of(milk))
        val entity = calculatedOrder()
        val record = converter.toRecord(entity).copy(price = Amount(30_000, "EUR"))

        converter.fillEntity(entity, record)

        assertThat(entity.rate).isNull()
        assertThat(entity.priceUsd).isEqualTo(Amount(0, "USD"))
    }

    @Test
    fun `fillEntity - keeps the USD price when only descriptive fields change`() {
        whenever(pricingItemRepository.findById(milk.id!!)).thenReturn(Optional.of(milk))
        val entity = calculatedOrder()
        // scale-only difference of the quantity is not a change
        val record = converter.toRecord(entity).copy(comment = "Promo", store = "Idea", quantity = BigDecimal("1.000"))

        converter.fillEntity(entity, record)

        assertThat(entity.rate).isEqualByComparingTo("1.25")
        assertThat(entity.priceUsd).isEqualTo(Amount(25_000, "USD"))
        assertThat(entity.comment).isEqualTo("Promo")
    }

}

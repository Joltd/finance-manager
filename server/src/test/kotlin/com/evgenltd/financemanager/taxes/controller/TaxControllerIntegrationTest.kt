package com.evgenltd.financemanager.taxes.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.taxes.entity.Tax
import com.evgenltd.financemanager.taxes.record.NewTax
import com.evgenltd.financemanager.taxes.repository.TaxRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import java.math.BigDecimal
import java.time.LocalDate

class TaxControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var taxRepository: TaxRepository

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        taxRepository.deleteAll()
    }

    @Test
    fun `yearBase - sums tax bases from the start of the year up to, but excluding, the requested month`() {
        taxRepository.save(Tax(date = LocalDate.of(2024, 1, 1), base = Amount(500_000L, "USD"), rate = BigDecimal("0.13"), amount = Amount(65_000L, "USD")))
        taxRepository.save(Tax(date = LocalDate.of(2024, 2, 1), base = Amount(300_000L, "USD"), rate = BigDecimal("0.13"), amount = Amount(39_000L, "USD")))
        taxRepository.save(Tax(date = LocalDate.of(2024, 3, 1), base = Amount(999_999L, "USD"), rate = BigDecimal("0.13"), amount = Amount(1L, "USD"))) // excluded: same month as the query
        taxRepository.save(Tax(date = LocalDate.of(2023, 12, 1), base = Amount(999_999L, "USD"), rate = BigDecimal("0.13"), amount = Amount(1L, "USD"))) // excluded: previous year

        // Unlike every other controller, TaxController has no @DataResponse annotation, so its
        // responses are NOT wrapped in the usual {success, body, error} envelope - deserialize directly.
        val amount = restClient.get()
            .uri("/api/v1/tax/year?date=2024-03-15&currency=USD")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(Amount::class.java)

        assertThat(amount).isEqualTo(Amount(800_000L, "USD"))
    }

    @Test
    fun `saveNewTax - persists a tax row normalized to the first day of the month`() {
        val response = restClient.post()
            .uri("/api/v1/tax")
            .headers { it.addAll(authHeaders()) }
            .body(
                NewTax(
                    date = LocalDate.of(2024, 3, 15),
                    base = Amount(500_000L, "USD"),
                    rate = BigDecimal("0.13"),
                    amount = Amount(65_000L, "USD"),
                )
            )
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val taxes = taxRepository.findAll()
        assertThat(taxes).hasSize(1)
        assertThat(taxes.first().date).isEqualTo(LocalDate.of(2024, 3, 1))
        assertThat(taxes.first().base).isEqualTo(Amount(500_000L, "USD"))
    }
}

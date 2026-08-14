package com.evgenltd.financemanager.report.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.report.record.DashboardRecord
import com.evgenltd.financemanager.testsupport.ApiResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.core.ParameterizedTypeReference
import java.time.LocalDate

/**
 * Seeds only a USD balance with no operations/transactions, so DashboardService.load()
 * takes its early-return path (no transactions) and never needs a real/stubbed
 * exchange-rate provider - USD is BASE_CURRENCY and the default target currency when no
 * Settings row exists, so ExchangeRateIndex.toTarget short-circuits on same-currency amounts.
 */
class DashboardControllerIntegrationTest : AbstractIntegrationTest() {

    @BeforeEach
    fun setUp() {
        cleanupTestData()
    }

    @Test
    fun `load - sums account balances in the default currency with no transactions in range`() {
        withTenant {
            val bankAccount = accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT))
            balanceRepository.save(Balance(account = bankAccount, amount = Amount(1_500_000L, "USD"), date = LocalDate.of(2024, 1, 1)))
        }

        val response = restClient.get()
            .uri("/api/v1/dashboard")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<DashboardRecord>>() {})

        val dashboard = response!!.body!!
        assertThat(dashboard.totalBalance).isEqualTo(Amount(1_500_000L, "USD"))
        assertThat(dashboard.avgMonthly.net).isEqualTo(Amount(0, "USD"))
        assertThat(dashboard.topExpenses).isEmpty()
    }
}

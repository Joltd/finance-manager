package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.testsupport.ApiResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpStatus

/**
 * Covers the import endpoints intentionally kept while the UI-specific import API is disabled.
 */
class ImportDataControllerIntegrationTest : AbstractIntegrationTest() {

    private lateinit var account: Account

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        withTenant { account = accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT)) }
    }

    @Test
    fun `list - returns a reference for every import`() {
        withTenant { importDataRepository.save(ImportData(account = account)) }

        val response = restClient.get()
            .uri("/api/v1/import-data")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<Reference>>>() {})

        assertThat(response!!.body).hasSize(1)
        assertThat(response.body!!.first().name).startsWith("Bank - ")
    }

    @Test
    fun `get - returns the full record with account and empty totals`() {
        val importData = withTenant { importDataRepository.save(ImportData(account = account, currency = "USD")) }

        val response = restClient.get()
            .uri("/api/v1/import-data/${importData.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<ImportDataRecord>>() {})

        val record = response!!.body!!
        assertThat(record.account.name).isEqualTo("Bank")
        assertThat(record.currency).isEqualTo("USD")
        assertThat(record.dateRange).isNull()
        assertThat(record.totals).isEmpty()
    }

    @Test
    fun `delete - removes the import data row`() {
        val importData = withTenant { importDataRepository.save(ImportData(account = account)) }

        val response = restClient.delete()
            .uri("/api/v1/import-data/${importData.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        withTenant { assertThat(importDataRepository.findById(importData.id!!)).isEmpty() }
    }
}

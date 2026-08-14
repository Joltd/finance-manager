package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.testsupport.ApiResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpStatus
import java.time.LocalDate

/**
 * Covers the simple CRUD-shaped endpoints (list/get/actual-balance/reset-revision/delete),
 * which wrap ImportDataProcessService methods already covered directly in
 * ImportDataProcessServiceTest - this just confirms the HTTP wiring. beginNewImport (multipart
 * file upload -> parse pipeline) and the entry link/unlink/approve endpoints are deferred, same
 * reasoning as the rest of that heavier pipeline in Phase 2.
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
    fun `saveActualBalance - persists a total for the given currency`() {
        val importData = withTenant { importDataRepository.save(ImportData(account = account)) }

        val response = restClient.post()
            .uri("/api/v1/import-data/${importData.id}/actual-balance")
            .headers { it.addAll(authHeaders()) }
            .body(Amount(1_000_000L, "USD"))
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        withTenant {
            val totals = importDataTotalRepository.findByImportData(importDataRepository.find(importData.id!!))
            assertThat(totals).extracting("actual").containsExactly(Amount(1_000_000L, "USD"))
        }
    }

    @Test
    fun `resetRevision - sets the account's revise date to today`() {
        val importData = withTenant {
            account.reviseDate = LocalDate.of(2020, 1, 1)
            accountRepository.save(account)
            importDataRepository.save(ImportData(account = account))
        }

        val response = restClient.post()
            .uri("/api/v1/import-data/${importData.id}/reset-revision")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        withTenant { assertThat(accountRepository.find(account.id!!).reviseDate).isEqualTo(LocalDate.now()) }
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

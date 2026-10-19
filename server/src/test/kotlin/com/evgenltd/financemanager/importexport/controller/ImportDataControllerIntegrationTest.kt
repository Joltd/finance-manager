package com.evgenltd.financemanager.importexport.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataDay
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataParsingStatus
import com.evgenltd.financemanager.importexport.record.ImportDataDayRecord
import com.evgenltd.financemanager.importexport.record.ImportDataRecord
import com.evgenltd.financemanager.importexport.service.ImportDataActionService
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationData
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.testsupport.ApiResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpStatus
import java.time.LocalDate

/**
 * Covers the import endpoints intentionally kept while the UI-specific import API is disabled.
 */
class ImportDataControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var importDataActionService: ImportDataActionService

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
    fun `get - exposes processing and failure states`() {
        val cases = listOf(
            ImportDataParsingStatus.PARSING to null,
            ImportDataParsingStatus.DONE to null,
            ImportDataParsingStatus.FAILED to "Unable to parse file",
        )

        cases.forEach { (status, message) ->
            val importData = withTenant {
                importDataRepository.save(
                    ImportData(account = account, parsingStatus = status, message = message)
                )
            }
            val response = restClient.get()
                .uri("/api/v1/import-data/${importData.id}")
                .headers { it.addAll(authHeaders()) }
                .retrieve()
                .body(object : ParameterizedTypeReference<ApiResponse<ImportDataRecord>>() {})

            val record = response!!.body!!
            assertThat(record.parsingStatus).isEqualTo(status)
            assertThat(record.message).isEqualTo(message)
        }
    }

    @Test
    fun `entry list - returns linked, import-only and operation-only rows without duplicates`() {
        val date = LocalDate.of(2026, 9, 14)
        val counterparty = withTenant {
            accountRepository.save(Account(name = "Groceries", type = AccountType.EXPENSE))
        }
        val importData = withTenant {
            importDataRepository.save(ImportData(account = account, currency = "USD"))
        }
        val day = withTenant {
            importDataDayRepository.save(ImportDataDay(importData = importData, date = date))
        }
        val linkedOperation = withTenant {
            operationRepository.save(operation(date, counterparty, Amount(10_000, "USD")))
        }
        val standaloneOperation = withTenant {
            operationRepository.save(operation(date, counterparty, Amount(20_000, "USD")))
        }
        withTenant {
            operationRepository.save(operation(date, counterparty, Amount(30_000, "EUR")))
            val linkedData = operationDataRepository.save(OperationData(raw = "linked row"))
            val importOnlyData = operationDataRepository.save(OperationData(raw = "import-only row"))
            val undatedData = operationDataRepository.save(OperationData(raw = "undated row"))
            importDataEntryRepository.save(
                ImportDataEntry(
                    importDataDay = day,
                    operation = linkedOperation,
                    operationData = linkedData,
                    date = date,
                    type = OperationType.EXPENSE,
                    amountFrom = Amount(10_000, "USD"),
                    accountFrom = account,
                    amountTo = Amount(10_000, "USD"),
                    accountTo = counterparty,
                )
            )
            importDataEntryRepository.save(
                ImportDataEntry(
                    importDataDay = day,
                    operationData = importOnlyData,
                    date = date,
                    type = OperationType.EXPENSE,
                    amountFrom = Amount(40_000, "USD"),
                    accountFrom = account,
                    amountTo = Amount(40_000, "USD"),
                    accountTo = counterparty,
                )
            )
            val undatedDay = importDataDayRepository.save(ImportDataDay(importData = importData, date = null))
            importDataEntryRepository.save(
                ImportDataEntry(importDataDay = undatedDay, operationData = undatedData)
            )
        }

        val response = restClient.get()
            .uri("/api/v1/import-data/${importData.id}/entry?pointers=$date")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<ImportDataDayRecord>>>() {})

        val rows = response!!.body!!.single().entries
        assertThat(rows).hasSize(3)
        assertThat(rows).anySatisfy { row ->
            assertThat(row.entry?.raw).isEqualTo("linked row")
            assertThat(row.operation?.id).isEqualTo(linkedOperation.id)
        }
        assertThat(rows).anySatisfy { row ->
            assertThat(row.entry?.raw).isEqualTo("import-only row")
            assertThat(row.operation).isNull()
        }
        assertThat(rows).anySatisfy { row ->
            assertThat(row.entry).isNull()
            assertThat(row.operation?.id).isEqualTo(standaloneOperation.id)
        }
        assertThat(rows.mapNotNull { it.operation?.id }).containsOnlyOnce(linkedOperation.id)
    }

    @Test
    fun `entry list - seeks in both directions across import and operation-only dates`() {
        val pointer = LocalDate.of(2026, 9, 14)
        val olderDate = pointer.minusDays(1)
        val newerDate = pointer.plusDays(1)
        val counterparty = withTenant {
            accountRepository.save(Account(name = "Groceries", type = AccountType.EXPENSE))
        }
        val importData = withTenant {
            importDataRepository.save(ImportData(account = account, currency = "USD"))
        }
        withTenant {
            importDataDayRepository.save(ImportDataDay(importData = importData, date = olderDate))
            operationRepository.save(operation(newerDate, counterparty, Amount(10_000, "USD")))
        }

        fun seek(direction: String): List<ImportDataDayRecord> = restClient.get()
            .uri("/api/v1/import-data/${importData.id}/entry?pointer=$pointer&direction=$direction")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<ImportDataDayRecord>>>() {})!!
            .body!!

        assertThat(seek("BACKWARD").map { it.date }).containsExactly(olderDate)
        assertThat(seek("FORWARD").map { it.date }).containsExactly(newerDate)
    }

    @Test
    fun `commit - creates and links operations only for valid unlinked entries`() {
        val date = LocalDate.of(2026, 9, 14)
        val counterparty = withTenant {
            accountRepository.save(Account(name = "Groceries", type = AccountType.EXPENSE))
        }
        val importData = withTenant {
            importDataRepository.save(
                ImportData(account = account, currency = "USD", parsingStatus = ImportDataParsingStatus.DONE)
            )
        }
        val existingOperation = withTenant {
            operationRepository.save(operation(date, counterparty, Amount(10_000, "USD")))
        }
        val (linked, committable, invalid) = withTenant {
            val day = importDataDayRepository.save(ImportDataDay(importData = importData, date = date))
            fun entry(raw: String, accountTo: Account?, amount: Amount, operation: Operation? = null) =
                importDataEntryRepository.save(
                    ImportDataEntry(
                        importDataDay = day,
                        operation = operation,
                        operationData = operationDataRepository.save(OperationData(raw = raw)),
                        date = date,
                        type = OperationType.EXPENSE,
                        amountFrom = amount,
                        accountFrom = account,
                        amountTo = amount,
                        accountTo = accountTo,
                        description = raw,
                        valid = accountTo != null,
                    )
                )
            Triple(
                entry("linked row", counterparty, Amount(10_000, "USD"), existingOperation),
                entry("committable row", counterparty, Amount(40_000, "USD")),
                entry("invalid row", null, Amount(50_000, "USD")),
            )
        }

        fun commit() = restClient.post()
            .uri("/api/v1/import-data/${importData.id}/commit")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .toEntity(String::class.java)

        fun parsedTotals() = withTenant {
            importDataTotalRepository.findAll()
                .partition { it.importData?.id == importData.id }
                .let { (importTotals, dayTotals) ->
                    importTotals.single().parsed to dayTotals.single().parsed
                }
        }

        // a processed import always has totals, so commit has to rebuild existing ones
        withTenant { importDataActionService.calculateTotals(importData.id!!) }
        assertThat(parsedTotals()).isEqualTo(Amount(-90_000, "USD") to Amount(-90_000, "USD"))

        assertThat(commit().statusCode).isEqualTo(HttpStatus.OK)

        assertThat(parsedTotals()).isEqualTo(Amount(-50_000, "USD") to Amount(-50_000, "USD"))
        withTenant {
            assertThat(operationRepository.count()).isEqualTo(2)
            val committed = importDataEntryRepository.findById(committable.id!!).get().operation!!
            assertThat(committed.id).isNotEqualTo(existingOperation.id)
            assertThat(committed.amountFrom).isEqualTo(Amount(40_000, "USD"))
            assertThat(committed.accountTo.id).isEqualTo(counterparty.id)
            assertThat(committed.description).isEqualTo("committable row")
            assertThat(committed.operationData?.id).isEqualTo(committable.operationData.id)
            assertThat(importDataEntryRepository.findById(linked.id!!).get().operation?.id)
                .isEqualTo(existingOperation.id)
            assertThat(importDataEntryRepository.findById(invalid.id!!).get().operation).isNull()
            assertThat(accountRepository.findById(account.id!!).get().reviseDate).isEqualTo(date)
        }

        assertThat(commit().statusCode).isEqualTo(HttpStatus.OK)
        withTenant { assertThat(operationRepository.count()).isEqualTo(2) }
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

    private fun operation(date: LocalDate, counterparty: Account, amount: Amount) = Operation(
        date = date,
        type = OperationType.EXPENSE,
        amountFrom = amount,
        accountFrom = account,
        amountTo = amount,
        accountTo = counterparty,
        description = null,
    )
}

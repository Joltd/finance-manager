package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.entity.ImportData
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate
import java.util.UUID

/**
 * Covers the simpler, lock-wrapped mutation methods of ImportDataProcessService
 * (saveActualBalance/resetRevision/delete). The heavier pipeline (beginNewImport,
 * calculateTotal) needs file + AI-provider fixtures and is deferred - same reasoning
 * as skipping the HTML-based Sber/BCC import parsers in Phase 1.
 *
 * Extends AbstractIntegrationTest (not the transactional AbstractRepositoryTest) because
 * ImportDataProcessService is itself @Transactional(propagation = Propagation.NEVER) in
 * production - an ambient test transaction would conflict with that.
 */
class ImportDataProcessServiceTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var importDataProcessService: ImportDataProcessService

    private lateinit var account: Account

    @BeforeEach
    fun setUp() {
        cleanupTestData()
        withTenant {
            account = accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT))
        }
    }

    @Test
    fun `saveActualBalance - creates a total for a currency seen for the first time`() {
        val importDataId = withTenant { importDataRepository.save(ImportData(account = account)).id!! }

        withTenant { importDataProcessService.saveActualBalance(importDataId, Amount(1_000_000L, "USD")) }

        withTenant {
            val totals = importDataTotalRepository.findByImportData(importDataRepository.find(importDataId))
            assertThat(totals).hasSize(1)
            assertThat(totals.first().currency).isEqualTo("USD")
            assertThat(totals.first().actual).isEqualTo(Amount(1_000_000L, "USD"))
        }
    }

    @Test
    fun `saveActualBalance - updates the existing total for the same currency instead of duplicating it`() {
        val importDataId = withTenant { importDataRepository.save(ImportData(account = account)).id!! }
        withTenant { importDataProcessService.saveActualBalance(importDataId, Amount(1_000_000L, "USD")) }

        withTenant { importDataProcessService.saveActualBalance(importDataId, Amount(2_000_000L, "USD")) }

        withTenant {
            val totals = importDataTotalRepository.findByImportData(importDataRepository.find(importDataId))
            assertThat(totals).hasSize(1)
            assertThat(totals.first().actual).isEqualTo(Amount(2_000_000L, "USD"))
        }
    }

    @Test
    fun `resetRevision - sets the account's revise date to today`() {
        val importDataId = withTenant {
            account.reviseDate = LocalDate.of(2020, 1, 1)
            accountRepository.save(account)
            importDataRepository.save(ImportData(account = account)).id!!
        }

        withTenant { importDataProcessService.resetRevision(importDataId) }

        withTenant {
            assertThat(accountRepository.find(account.id!!).reviseDate).isEqualTo(LocalDate.now())
        }
    }

    @Test
    fun `delete - removes the import data row`() {
        val importDataId = withTenant { importDataRepository.save(ImportData(account = account)).id!! }

        withTenant { importDataProcessService.delete(importDataId) }

        withTenant {
            assertThat(importDataRepository.findById(importDataId)).isEmpty()
        }
    }
}

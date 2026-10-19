package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.record.BalanceCalculationCompleted
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataParsingStatus
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.record.OperationChangeRecord
import com.evgenltd.financemanager.operation.record.OperationChangeStateRecord
import com.evgenltd.financemanager.operation.service.OperationProcessService
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.inOrder
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoInteractions
import org.mockito.kotlin.whenever
import java.time.LocalDate
import java.util.UUID

class ImportDataProcessServiceTest {

    private val actionService = mock<ImportDataActionService>()
    private val eventService = mock<ImportDataEventService>()
    private val importDataRepository = mock<ImportDataRepository>()
    private val operationProcessService = mock<OperationProcessService>()
    private val service = ImportDataProcessService(
        actionService,
        eventService,
        importDataRepository,
        operationProcessService,
    )
    private val importId = UUID.randomUUID()

    @Test
    fun `beginNewImport - runs every stage in order and batches embeddings`() {
        executeLockedBlock()
        whenever(actionService.parseImportData(importId, "statement.csv")).thenReturn(listOf(parsedEntry()))
        val entryIds = (1..51).map { UUID.randomUUID() }
        whenever(actionService.prepareImportData(eq(importId), any())).thenReturn(entryIds)

        service.beginNewImport(importId, "statement.csv")

        inOrder(actionService) {
            verify(actionService).updateParsingStatus(importId, ImportDataParsingStatus.PARSING, null)
            verify(actionService).parseImportData(importId, "statement.csv")
            verify(actionService).updateParsingStatus(importId, ImportDataParsingStatus.PREPARATION, null)
            verify(actionService).prepareImportData(eq(importId), any())
            verify(actionService).updateParsingStatus(importId, ImportDataParsingStatus.EMBEDDING, null)
            verify(actionService).prepareHintEmbeddings(entryIds.take(50))
            verify(actionService).prepareHintEmbeddings(entryIds.drop(50))
            verify(actionService).updateParsingStatus(importId, ImportDataParsingStatus.SUGGESTION, null)
            verify(actionService).prepareSuggestions(importId)
            verify(actionService).updateParsingStatus(importId, ImportDataParsingStatus.LINKING, null)
            verify(actionService).linkEntries(importId)
            verify(actionService).updateParsingStatus(importId, ImportDataParsingStatus.CALCULATION, null)
            verify(actionService).calculateTotals(importId)
            verify(actionService).updateParsingStatus(importId, ImportDataParsingStatus.DONE, null)
        }
    }

    @Test
    fun `beginNewImport - empty parse result marks import failed`() {
        executeLockedBlock()
        whenever(actionService.parseImportData(importId, "empty.csv")).thenReturn(emptyList())

        service.beginNewImport(importId, "empty.csv")

        verify(actionService).updateParsingStatus(
            importId,
            ImportDataParsingStatus.FAILED,
            "No transaction entries were parsed",
        )
        verify(actionService, never()).prepareImportData(eq(importId), any())
    }

    @Test
    fun `beginNewImport - stage exception marks import failed`() {
        executeLockedBlock()
        whenever(actionService.parseImportData(importId, "broken.csv")).thenThrow(IllegalStateException("AI unavailable"))

        service.beginNewImport(importId, "broken.csv")

        verify(actionService).updateParsingStatus(importId, ImportDataParsingStatus.FAILED, "AI unavailable")
    }

    @Test
    fun `commit - notifies operation changes after commit and refreshes import`() {
        executeBlockingLockedBlock()
        val date = LocalDate.of(2026, 2, 3)
        val changes = listOf(change(date), change(date), change(date.plusDays(1)))
        whenever(actionService.commit(importId)).thenReturn(changes)

        service.commit(importId)

        inOrder(actionService, operationProcessService, eventService) {
            verify(actionService).commit(importId)
            verify(operationProcessService).notifyChanges(changes)
            verify(eventService).importData(importId)
            verify(eventService).importDataEntry(importId, listOf(date, date.plusDays(1)))
        }
    }

    @Test
    fun `commit - nothing committed skips entry event`() {
        executeBlockingLockedBlock()
        whenever(actionService.commit(importId)).thenReturn(emptyList())

        service.commit(importId)

        verify(operationProcessService).notifyChanges(emptyList())
        verify(eventService).importData(importId)
        verify(eventService, never()).importDataEntry(any(), any())
    }

    @Test
    fun `commit - failed commit does not notify changes`() {
        executeBlockingLockedBlock()
        whenever(actionService.commit(importId)).thenThrow(IllegalStateException("constraint violation"))

        assertThatThrownBy { service.commit(importId) }.isInstanceOf(IllegalStateException::class.java)

        verifyNoInteractions(operationProcessService, eventService)
    }

    @Test
    fun `balanceCalculationCompleted - refreshes imports of the account`() {
        val accountId = UUID.randomUUID()
        val account = Account(id = accountId, name = "Bank", type = AccountType.ACCOUNT)
        val first = ImportData(id = UUID.randomUUID(), account = account)
        val second = ImportData(id = UUID.randomUUID(), account = account)
        whenever(importDataRepository.findByAccountId(accountId)).thenReturn(listOf(first, second))

        service.balanceCalculationCompleted(BalanceCalculationCompleted(accountId, "USD"))

        verify(eventService).importData(first.id!!)
        verify(eventService).importData(second.id!!)
    }

    private fun executeBlockingLockedBlock() {
        whenever(actionService.withLock(eq(importId), any<() -> Any>())).thenAnswer {
            it.getArgument<() -> Any>(1).invoke()
        }
    }

    private fun change(date: LocalDate) = OperationChangeRecord(
        old = null,
        new = OperationChangeStateRecord(
            id = UUID.randomUUID(),
            date = date,
            type = OperationType.EXPENSE,
            amountFrom = Amount(1_000, "USD"),
            accountFrom = UUID.randomUUID(),
            accountFromType = AccountType.ACCOUNT,
            amountTo = Amount(1_000, "USD"),
            accountTo = UUID.randomUUID(),
            accountToType = AccountType.EXPENSE,
        ),
    )

    private fun executeLockedBlock() {
        whenever(actionService.withTryLock(eq(importId), any())).thenAnswer {
            it.getArgument<() -> Unit>(1).invoke()
            true
        }
    }

    private fun parsedEntry() = ImportDataParsedEntry(
        raw = "2026-01-02,10.00,USD",
        date = null,
        direction = null,
        amount = null,
        currency = null,
        transactionId = null,
        mcc = null,
        bankType = null,
        bankCategory = null,
        merchant = null,
        counterparty = null,
        purpose = null,
        description = null,
        message = null,
    )
}

package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.importexport.entity.ImportDataParsingStatus
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.inOrder
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.UUID

class ImportDataProcessServiceTest {

    private val actionService = mock<ImportDataActionService>()
    private val eventService = mock<ImportDataEventService>()
    private val service = ImportDataProcessService(actionService, eventService)
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

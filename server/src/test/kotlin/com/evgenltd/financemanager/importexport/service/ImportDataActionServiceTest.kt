package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.record.AccountReferenceRecord
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.ai.entity.Embedding
import com.evgenltd.financemanager.ai.service.EmbeddingActionService
import com.evgenltd.financemanager.common.record.TransactionDirection
import com.evgenltd.financemanager.common.service.LockService
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataDay
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataParsingStatus
import com.evgenltd.financemanager.importexport.record.ImportDataEntryUpdateRecord
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.record.AccountScore
import com.evgenltd.financemanager.importexport.repository.ImportDataDayRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataSuggestionRepository
import com.evgenltd.financemanager.operation.entity.OperationData
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.record.OperationChangeRecord
import com.evgenltd.financemanager.operation.repository.OperationDataRepository
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.service.OperationService
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoInteractions
import org.mockito.kotlin.whenever
import org.springframework.data.jpa.domain.Specification
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

class ImportDataActionServiceTest {

    private val parserResolver = mock<ImportDataParserResolver>()
    private val importDataRepository = mock<ImportDataRepository>()
    private val dayRepository = mock<ImportDataDayRepository>()
    private val entryRepository = mock<ImportDataEntryRepository>()
    private val suggestionRepository = mock<ImportDataSuggestionRepository>()
    private val operationDataRepository = mock<OperationDataRepository>()
    private val operationRepository = mock<OperationRepository>()
    private val accountRepository = mock<AccountRepository>()
    private val embeddingActionService = mock<EmbeddingActionService>()
    private val lockService = mock<LockService>()
    private val operationService = mock<OperationService>()
    private val service = ImportDataActionService(
        parserResolver,
        importDataRepository,
        dayRepository,
        entryRepository,
        suggestionRepository,
        operationDataRepository,
        operationRepository,
        accountRepository,
        embeddingActionService,
        lockService,
        ImportDataConverter(mock(), mock()),
        operationService,
    )

    private val importId = UUID.randomUUID()
    private val account = Account(id = UUID.randomUUID(), name = "Bank", type = AccountType.ACCOUNT)
    private val importData = ImportData(id = importId, account = account, currency = "USD")

    @BeforeEach
    fun setUp() {
        whenever(importDataRepository.findById(importId)).thenReturn(Optional.of(importData))
        whenever(dayRepository.saveAll(any<Iterable<ImportDataDay>>())).thenAnswer {
            it.getArgument<Iterable<ImportDataDay>>(0).onEach { day -> day.id = UUID.randomUUID() }.toList()
        }
        whenever(operationDataRepository.save(any<OperationData>())).thenAnswer {
            it.getArgument<OperationData>(0).apply { id = UUID.randomUUID() }
        }
        whenever(entryRepository.save(any<ImportDataEntry>())).thenAnswer {
            it.getArgument<ImportDataEntry>(0).apply { id = UUID.randomUUID() }
        }
    }

    @Test
    fun `prepareImportData - maps complete and partial parsed entries`() {
        val date = LocalDate.of(2026, 2, 3)
        val complete = parsedEntry(
            raw = "complete row",
            date = date,
            direction = TransactionDirection.OUT,
            amount = "-12.34",
            currency = "EUR",
            transactionId = "tx-1",
            mcc = "5411",
            bankType = "Card purchase",
            bankCategory = "Groceries",
            merchant = "Market",
            counterparty = "Market LLC",
            purpose = "Food",
            description = "Weekly shop",
        )
        val partial = parsedEntry(raw = "unparsed row", message = "Missing required facts")

        val ids = service.prepareImportData(importId, listOf(complete, partial))

        assertThat(ids).hasSize(2)
        val entryCaptor = argumentCaptor<ImportDataEntry>()
        verify(entryRepository, org.mockito.kotlin.times(2)).save(entryCaptor.capture())
        val completeEntry = entryCaptor.allValues[0]
        assertThat(completeEntry.importDataDay.date).isEqualTo(date)
        assertThat(completeEntry.date).isEqualTo(date)
        assertThat(completeEntry.type).isEqualTo(OperationType.EXPENSE)
        assertThat(completeEntry.amountFrom).isEqualTo(Amount(123400, "EUR"))
        assertThat(completeEntry.amountTo).isEqualTo(Amount(123400, "EUR"))
        assertThat(completeEntry.accountFrom).isSameAs(account)
        assertThat(completeEntry.accountTo).isNull()
        assertThat(completeEntry.description).isEqualTo("Weekly shop")
        assertThat(completeEntry.valid).isFalse()
        assertThat(completeEntry.operationData.transactionId).isEqualTo("tx-1")
        assertThat(completeEntry.operationData.mcc).isEqualTo("5411")
        assertThat(completeEntry.operationData.bankType).isEqualTo("Card purchase")
        assertThat(completeEntry.operationData.bankCategory).isEqualTo("Groceries")
        assertThat(completeEntry.operationData.merchant).isEqualTo("Market")
        assertThat(completeEntry.operationData.counterparty).isEqualTo("Market LLC")
        assertThat(completeEntry.operationData.purpose).isEqualTo("Food")
        assertThat(completeEntry.operationData.raw).isEqualTo("complete row")

        val partialEntry = entryCaptor.allValues[1]
        assertThat(partialEntry.importDataDay.date).isNull()
        assertThat(partialEntry.date).isNull()
        assertThat(partialEntry.type).isNull()
        assertThat(partialEntry.amountFrom).isNull()
        assertThat(partialEntry.amountTo).isNull()
        assertThat(partialEntry.accountFrom).isNull()
        assertThat(partialEntry.accountTo).isNull()
        assertThat(partialEntry.operationData.raw).isEqualTo("unparsed row")
        assertThat(partialEntry.valid).isFalse()
    }

    @Test
    fun `hintInput - uses labeled facts in stable order and raw only as fallback`() {
        val structured = OperationData(
            raw = "raw row",
            bankType = "Transfer",
            bankCategory = "Payments",
            merchant = "Merchant",
            counterparty = "Counterparty",
            purpose = "Invoice",
            mcc = "4829",
        )

        assertThat(service.hintInput(structured)).isEqualTo(
            "bankType: Transfer\nbankCategory: Payments\nmerchant: Merchant\n" +
                "counterparty: Counterparty\npurpose: Invoice\nmcc: 4829",
        )
        assertThat(service.hintInput(OperationData(raw = "raw fallback"))).isEqualTo("raw fallback")
    }

    @Test
    fun `prepareHintEmbeddings - saves generated embeddings on operation data`() {
        val first = OperationData(raw = "first", merchant = "Shop")
        val second = OperationData(raw = "second")
        whenever(entryRepository.findOperationDataWithoutHint(listOf(importId))).thenReturn(listOf(first, second))
        val embeddings = listOf(Embedding(input = "merchant: Shop"), Embedding(input = "second"))
        whenever(embeddingActionService.prepareEmbeddings(any())).thenReturn(embeddings)

        service.prepareHintEmbeddings(listOf(importId))

        verify(embeddingActionService).prepareEmbeddings(listOf("merchant: Shop", "second"))
        assertThat(first.hint).isSameAs(embeddings[0])
        assertThat(second.hint).isSameAs(embeddings[1])
        verify(operationDataRepository).saveAll(eq(listOf(first, second)))
    }

    @Test
    fun `prepareSuggestions - stores ranked candidates and fills expense target above threshold`() {
        val day = ImportDataDay(id = UUID.randomUUID(), importData = importData, date = LocalDate.of(2026, 2, 3))
        val entry = importEntry(day, OperationType.EXPENSE, accountFrom = account)
        val groceries = Account(id = UUID.randomUUID(), name = "Groceries", type = AccountType.EXPENSE)
        val transport = Account(id = UUID.randomUUID(), name = "Transport", type = AccountType.EXPENSE)
        whenever(entryRepository.findForSuggestions(importId)).thenReturn(listOf(entry))
        whenever(entryRepository.findSimilarAccountsByHint(entry.id!!)).thenReturn(
            listOf(score(groceries.id!!, 2.5), score(transport.id!!, 0.8)),
        )
        whenever(accountRepository.findAllById(listOf(groceries.id!!, transport.id!!)))
            .thenReturn(listOf(transport, groceries))

        service.prepareSuggestions(importId)

        assertThat(entry.suggestions.map { it.account }).containsExactly(groceries, transport)
        assertThat(entry.suggestions.map { it.score }).containsExactly(2.5, 0.8)
        assertThat(entry.suggestions).allMatch { it.description == entry.description }
        assertThat(entry.accountTo).isSameAs(groceries)
        assertThat(entry.valid).isTrue()
        verify(suggestionRepository).saveAll(entry.suggestions)
    }

    @Test
    fun `prepareSuggestions - does not fill account when best score is at threshold`() {
        val day = ImportDataDay(id = UUID.randomUUID(), importData = importData, date = LocalDate.of(2026, 2, 3))
        val entry = importEntry(day, OperationType.INCOME, accountTo = account)
        val salary = Account(id = UUID.randomUUID(), name = "Salary", type = AccountType.INCOME)
        whenever(entryRepository.findForSuggestions(importId)).thenReturn(listOf(entry))
        whenever(entryRepository.findSimilarAccountsByHint(entry.id!!)).thenReturn(listOf(score(salary.id!!, 1.0)))
        whenever(accountRepository.findAllById(listOf(salary.id!!))).thenReturn(listOf(salary))

        service.prepareSuggestions(importId)

        assertThat(entry.suggestions).hasSize(1)
        assertThat(entry.accountFrom).isNull()
        assertThat(entry.valid).isFalse()
    }

    @Test
    fun `linkEntries - links exact match once and skips incomplete entries`() {
        val date = LocalDate.of(2026, 2, 3)
        val day = ImportDataDay(id = UUID.randomUUID(), importData = importData, date = date)
        val category = Account(id = UUID.randomUUID(), name = "Groceries", type = AccountType.EXPENSE)
        val first = importEntry(day, OperationType.EXPENSE, accountFrom = account, accountTo = category)
        val duplicate = importEntry(day, OperationType.EXPENSE, accountFrom = account, accountTo = category)
        val incomplete = importEntry(day, OperationType.EXPENSE, accountFrom = account)
        val operation = operation(date, OperationType.EXPENSE, account, category, Amount(1_000, "USD"))
        whenever(entryRepository.findEntriesByImportDataId(importId)).thenReturn(listOf(first, duplicate, incomplete))
        whenever(operationRepository.findAll(any<Specification<Operation>>())).thenReturn(listOf(operation))

        service.linkEntries(importId)

        assertThat(listOf(first, duplicate).mapNotNull { it.operation }).containsExactly(operation)
        assertThat(incomplete.operation).isNull()
    }

    @Test
    fun `calculateTotals - aggregates parsed entries without linked operation by currency`() {
        val date = LocalDate.of(2026, 2, 3)
        val day = ImportDataDay(id = UUID.randomUUID(), importData = importData, date = date)
        val linkedDay = ImportDataDay(id = UUID.randomUUID(), importData = importData, date = date.plusDays(1))
        importData.days.addAll(listOf(day, linkedDay))
        val expenseAccount = Account(id = UUID.randomUUID(), name = "Groceries", type = AccountType.EXPENSE)
        val incomeAccount = Account(id = UUID.randomUUID(), name = "Salary", type = AccountType.INCOME)
        val expense = importEntry(
            day,
            OperationType.EXPENSE,
            amount = Amount(1_000, "USD"),
            accountFrom = account,
            accountTo = expenseAccount,
        )
        val income = importEntry(
            day,
            OperationType.INCOME,
            amount = Amount(400, "USD"),
            accountFrom = incomeAccount,
            accountTo = account,
        )
        val foreignCurrency = importEntry(
            day,
            OperationType.EXPENSE,
            amount = Amount(2_000, "EUR"),
            accountFrom = account,
            accountTo = expenseAccount,
        )
        val incomplete = importEntry(day, null, amount = null)
        income.operation = operation(date, OperationType.INCOME, incomeAccount, account, Amount(400, "USD"))
        val linkedExpense = importEntry(
            linkedDay,
            OperationType.EXPENSE,
            amount = Amount(300, "USD"),
            accountFrom = account,
            accountTo = expenseAccount,
        )
        linkedExpense.operation = operation(linkedDay.date!!, OperationType.EXPENSE, account, expenseAccount, Amount(300, "USD"))
        whenever(entryRepository.findEntriesByImportDataId(importId))
            .thenReturn(listOf(expense, income, foreignCurrency, incomplete, linkedExpense))

        service.calculateTotals(importId)

        assertThat(day.totals).hasSize(1)
        assertThat(day.totals.single().parsed).isEqualTo(Amount(-1_000, "USD"))
        assertThat(day.totals.single().actual).isEqualTo(Amount(0, "USD"))
        assertThat(day.valid).isFalse()
        assertThat(linkedDay.totals.single().parsed).isEqualTo(Amount(0, "USD"))
        assertThat(importData.totals.single().parsed).isEqualTo(Amount(-1_000, "USD"))
        assertThat(importData.valid).isFalse()
        verifyNoInteractions(operationRepository)
    }

    @Test
    fun `commit - rejects import that is not processed yet`() {
        importData.parsingStatus = ImportDataParsingStatus.EMBEDDING

        assertThatThrownBy { service.commit(importId) }
            .isInstanceOf(ResponseStatusException::class.java)
            .hasMessageContaining("Import is not ready for commit")
        verifyNoInteractions(operationService)
    }

    @Test
    fun `commit - saves operations for candidates and links them to entries`() {
        importData.parsingStatus = ImportDataParsingStatus.DONE
        val date = LocalDate.of(2026, 2, 3)
        val day = ImportDataDay(id = UUID.randomUUID(), importData = importData, date = date)
        val category = Account(id = UUID.randomUUID(), name = "Groceries", type = AccountType.EXPENSE)
        val entry = importEntry(day, OperationType.EXPENSE, accountFrom = account, accountTo = category)
        val changes = listOf(OperationChangeRecord(old = null, new = null))
        whenever(entryRepository.findForCommit(importId)).thenReturn(listOf(entry))
        whenever(operationService.save(any())).thenReturn(changes)

        val result = service.commit(importId)

        assertThat(result).isSameAs(changes)
        val operationsCaptor = argumentCaptor<List<Operation>>()
        verify(operationService).save(operationsCaptor.capture())
        val operation = operationsCaptor.firstValue.single()
        assertThat(operation.id).isNull()
        assertThat(operation.date).isEqualTo(date)
        assertThat(operation.type).isEqualTo(OperationType.EXPENSE)
        assertThat(operation.amountFrom).isEqualTo(Amount(1_000, "USD"))
        assertThat(operation.accountFrom).isSameAs(account)
        assertThat(operation.amountTo).isEqualTo(Amount(1_000, "USD"))
        assertThat(operation.accountTo).isSameAs(category)
        assertThat(operation.description).isEqualTo("Description")
        assertThat(operation.operationData).isSameAs(entry.operationData)
        assertThat(entry.operation).isSameAs(operation)
        assertThat(account.reviseDate).isEqualTo(date)
        verify(entryRepository).findEntriesByImportDataId(importId)
    }

    @Test
    fun `commit - moves account revise date to the latest committed entry`() {
        importData.parsingStatus = ImportDataParsingStatus.DONE
        account.reviseDate = LocalDate.of(2026, 1, 31)
        val category = Account(id = UUID.randomUUID(), name = "Groceries", type = AccountType.EXPENSE)
        val entries = listOf(LocalDate.of(2026, 2, 5), LocalDate.of(2026, 2, 3))
            .map { ImportDataDay(id = UUID.randomUUID(), importData = importData, date = it) }
            .map { importEntry(it, OperationType.EXPENSE, accountFrom = account, accountTo = category) }
        whenever(entryRepository.findForCommit(importId)).thenReturn(entries)
        whenever(operationService.save(any())).thenReturn(emptyList())

        service.commit(importId)

        assertThat(account.reviseDate).isEqualTo(LocalDate.of(2026, 2, 5))
    }

    @Test
    fun `commit - keeps later account revise date`() {
        importData.parsingStatus = ImportDataParsingStatus.DONE
        account.reviseDate = LocalDate.of(2026, 3, 1)
        val day = ImportDataDay(id = UUID.randomUUID(), importData = importData, date = LocalDate.of(2026, 2, 3))
        val category = Account(id = UUID.randomUUID(), name = "Groceries", type = AccountType.EXPENSE)
        val entry = importEntry(day, OperationType.EXPENSE, accountFrom = account, accountTo = category)
        whenever(entryRepository.findForCommit(importId)).thenReturn(listOf(entry))
        whenever(operationService.save(any())).thenReturn(emptyList())

        service.commit(importId)

        assertThat(account.reviseDate).isEqualTo(LocalDate.of(2026, 3, 1))
    }

    @Test
    fun `commit - does nothing without candidates`() {
        importData.parsingStatus = ImportDataParsingStatus.DONE
        whenever(entryRepository.findForCommit(importId)).thenReturn(emptyList())

        val result = service.commit(importId)

        assertThat(result).isEmpty()
        assertThat(account.reviseDate).isNull()
        verify(operationService, never()).save(any())
    }

    @Test
    fun `updateEntry - updates the draft and recalculates validity and totals`() {
        importData.parsingStatus = ImportDataParsingStatus.DONE
        val date = LocalDate.of(2026, 2, 3)
        val day = ImportDataDay(id = UUID.randomUUID(), importData = importData, date = date)
        val category = Account(id = UUID.randomUUID(), name = "Groceries", type = AccountType.EXPENSE)
        val entry = stubEntry(importEntry(day, type = null, amount = null))
        stubAccounts(account, category)

        val dates = service.updateEntry(
            importId,
            entry.id!!,
            updateRecord(
                date,
                OperationType.EXPENSE,
                accountFrom = account,
                accountTo = category,
                amount = Amount(2_000, "USD"),
                description = "Lunch",
            ),
        )

        assertThat(dates).containsExactly(date)
        assertThat(entry.type).isEqualTo(OperationType.EXPENSE)
        assertThat(entry.amountFrom).isEqualTo(Amount(2_000, "USD"))
        assertThat(entry.accountFrom).isSameAs(account)
        assertThat(entry.amountTo).isEqualTo(Amount(2_000, "USD"))
        assertThat(entry.accountTo).isSameAs(category)
        assertThat(entry.description).isEqualTo("Lunch")
        assertThat(entry.valid).isTrue()
        verify(entryRepository).findEntriesByImportDataId(importId)
    }

    @Test
    fun `updateEntry - keeps an incomplete draft invalid`() {
        importData.parsingStatus = ImportDataParsingStatus.DONE
        val day = ImportDataDay(id = UUID.randomUUID(), importData = importData, date = LocalDate.of(2026, 2, 3))
        val entry = stubEntry(importEntry(day, OperationType.EXPENSE))
        stubAccounts(account)

        service.updateEntry(
            importId,
            entry.id!!,
            updateRecord(day.date!!, OperationType.EXPENSE, accountFrom = account, amount = null),
        )

        assertThat(entry.accountTo).isNull()
        assertThat(entry.amountFrom).isNull()
        assertThat(entry.valid).isFalse()
    }

    @Test
    fun `updateEntry - allows exchange within the import account`() {
        importData.parsingStatus = ImportDataParsingStatus.DONE
        val day = ImportDataDay(id = UUID.randomUUID(), importData = importData, date = LocalDate.of(2026, 2, 3))
        val entry = stubEntry(importEntry(day, OperationType.EXPENSE))
        stubAccounts(account)

        service.updateEntry(
            importId,
            entry.id!!,
            updateRecord(day.date!!, OperationType.EXCHANGE, accountFrom = account, accountTo = account),
        )

        assertThat(entry.type).isEqualTo(OperationType.EXCHANGE)
        assertThat(entry.valid).isTrue()
    }

    @Test
    fun `updateEntry - rejects entries that cannot be edited`() {
        val day = ImportDataDay(id = UUID.randomUUID(), importData = importData, date = LocalDate.of(2026, 2, 3))
        val foreignDay = ImportDataDay(
            id = UUID.randomUUID(),
            importData = ImportData(id = UUID.randomUUID(), account = account),
            date = day.date,
        )
        val category = Account(id = UUID.randomUUID(), name = "Groceries", type = AccountType.EXPENSE)
        val record = updateRecord(day.date!!, OperationType.EXPENSE, accountFrom = account, accountTo = category)
        stubAccounts(account, category)

        importData.parsingStatus = ImportDataParsingStatus.CALCULATION
        val notReady = stubEntry(importEntry(day, OperationType.EXPENSE))
        assertRejected(notReady, record, "Import is not ready for editing")

        importData.parsingStatus = ImportDataParsingStatus.DONE
        val foreign = stubEntry(importEntry(foreignDay, OperationType.EXPENSE))
        assertRejected(foreign, record, "Entry does not belong to the import")

        val linked = stubEntry(importEntry(day, OperationType.EXPENSE))
        linked.operation = operation(day.date!!, OperationType.EXPENSE, account, category, Amount(1_000, "USD"))
        assertRejected(linked, record, "Entry is already linked to an operation")
    }

    @Test
    fun `updateEntry - rejects accounts that break the import account rules`() {
        importData.parsingStatus = ImportDataParsingStatus.DONE
        val date = LocalDate.of(2026, 2, 3)
        val day = ImportDataDay(id = UUID.randomUUID(), importData = importData, date = date)
        val other = Account(id = UUID.randomUUID(), name = "Cash", type = AccountType.ACCOUNT)
        val groceries = Account(id = UUID.randomUUID(), name = "Groceries", type = AccountType.EXPENSE)
        val salary = Account(id = UUID.randomUUID(), name = "Salary", type = AccountType.INCOME)
        stubAccounts(account, other, groceries, salary)
        val entry = stubEntry(importEntry(day, OperationType.EXPENSE, accountFrom = account))

        val cases = listOf(
            updateRecord(date, OperationType.EXPENSE, accountFrom = other, accountTo = groceries)
                to "Expense must be paid from the import account",
            updateRecord(date, OperationType.INCOME, accountFrom = salary, accountTo = other)
                to "Income must be received to the import account",
            updateRecord(date, OperationType.TRANSFER, accountFrom = other, accountTo = null)
                to "Import account must be one of the operation sides",
            updateRecord(date, OperationType.EXPENSE, accountFrom = account, accountTo = salary)
                to "Invalid counterpart account type for EXPENSE",
            updateRecord(date, OperationType.EXCHANGE, accountFrom = groceries, accountTo = account)
                to "Invalid counterpart account type for EXCHANGE",
            updateRecord(date, OperationType.TRANSFER, accountFrom = account, accountTo = account)
                to "Transfer accounts must differ",
        )

        cases.forEach { (record, message) -> assertRejected(entry, record, message) }
        assertThat(entry.accountFrom).isSameAs(account)
        verify(entryRepository, never()).findEntriesByImportDataId(importId)
    }

    private fun assertRejected(entry: ImportDataEntry, record: ImportDataEntryUpdateRecord, message: String) {
        assertThatThrownBy { service.updateEntry(importId, entry.id!!, record) }
            .isInstanceOf(ResponseStatusException::class.java)
            .hasMessageContaining(message)
    }

    private fun stubEntry(entry: ImportDataEntry): ImportDataEntry = entry.also {
        whenever(entryRepository.findById(it.id!!)).thenReturn(Optional.of(it))
    }

    private fun stubAccounts(vararg accounts: Account) {
        accounts.forEach { whenever(accountRepository.findById(it.id!!)).thenReturn(Optional.of(it)) }
    }

    private fun updateRecord(
        date: LocalDate,
        type: OperationType,
        accountFrom: Account? = null,
        accountTo: Account? = null,
        amount: Amount? = Amount(1_000, "USD"),
        description: String? = null,
    ) = ImportDataEntryUpdateRecord(
        date = date,
        type = type,
        amountFrom = amount,
        accountFrom = accountFrom?.let { reference(it) },
        amountTo = amount,
        accountTo = accountTo?.let { reference(it) },
        description = description,
    )

    private fun reference(account: Account) = AccountReferenceRecord(
        id = account.id!!,
        name = account.name,
        deleted = account.deleted,
        type = account.type,
        reviseDate = account.reviseDate,
    )

    private fun parsedEntry(
        raw: String,
        date: LocalDate? = null,
        direction: TransactionDirection? = null,
        amount: String? = null,
        currency: String? = null,
        transactionId: String? = null,
        mcc: String? = null,
        bankType: String? = null,
        bankCategory: String? = null,
        merchant: String? = null,
        counterparty: String? = null,
        purpose: String? = null,
        description: String? = null,
        message: String? = null,
    ) = ImportDataParsedEntry(
        raw,
        date,
        direction,
        amount,
        currency,
        transactionId,
        mcc,
        bankType,
        bankCategory,
        merchant,
        counterparty,
        purpose,
        description,
        message,
    )

    private fun importEntry(
        day: ImportDataDay,
        type: OperationType?,
        amount: Amount? = Amount(1_000, "USD"),
        accountFrom: Account? = null,
        accountTo: Account? = null,
    ) = ImportDataEntry(
        id = UUID.randomUUID(),
        importDataDay = day,
        operationData = OperationData(raw = "row", hint = Embedding(input = "hint")),
        date = day.date,
        type = type,
        amountFrom = amount,
        accountFrom = accountFrom,
        amountTo = amount,
        accountTo = accountTo,
        description = "Description",
    )

    private fun operation(
        date: LocalDate,
        type: OperationType,
        accountFrom: Account,
        accountTo: Account,
        amount: Amount,
    ) = Operation(
        id = UUID.randomUUID(),
        date = date,
        type = type,
        amountFrom = amount,
        accountFrom = accountFrom,
        amountTo = amount,
        accountTo = accountTo,
        description = null,
    )

    private fun score(accountId: UUID, value: Double) = object : AccountScore {
        override val accountId = accountId
        override val score = value
    }
}

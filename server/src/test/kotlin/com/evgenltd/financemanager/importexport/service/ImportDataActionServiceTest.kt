package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.ai.entity.Embedding
import com.evgenltd.financemanager.ai.service.EmbeddingActionService
import com.evgenltd.financemanager.common.record.TransactionDirection
import com.evgenltd.financemanager.common.service.LockService
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataDay
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.record.ImportDataParsedEntry
import com.evgenltd.financemanager.importexport.record.AccountScore
import com.evgenltd.financemanager.importexport.repository.ImportDataDayRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataEntryRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataSuggestionRepository
import com.evgenltd.financemanager.operation.entity.OperationData
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.repository.OperationDataRepository
import com.evgenltd.financemanager.operation.repository.OperationRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.data.jpa.domain.Specification
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
    fun `calculateTotals - aggregates parsed entries and all account operations by currency`() {
        val date = LocalDate.of(2026, 2, 3)
        val day = ImportDataDay(id = UUID.randomUUID(), importData = importData, date = date)
        importData.days.add(day)
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
        whenever(entryRepository.findEntriesByImportDataId(importId))
            .thenReturn(listOf(expense, income, foreignCurrency, incomplete))
        whenever(operationRepository.findAll(any<Specification<Operation>>())).thenReturn(
            listOf(
                operation(date, OperationType.EXPENSE, account, expenseAccount, Amount(800, "USD")),
                operation(date, OperationType.INCOME, incomeAccount, account, Amount(300, "USD")),
                operation(date, OperationType.EXPENSE, account, expenseAccount, Amount(1_500, "EUR")),
            ),
        )

        service.calculateTotals(importId)

        assertThat(day.totals).hasSize(1)
        assertThat(day.totals.single().parsed).isEqualTo(Amount(-600, "USD"))
        assertThat(day.totals.single().operation).isEqualTo(Amount(-500, "USD"))
        assertThat(day.totals.single().suggested).isEqualTo(Amount(0, "USD"))
        assertThat(day.totals.single().actual).isEqualTo(Amount(0, "USD"))
        assertThat(day.valid).isFalse()
        assertThat(importData.totals.single().parsed).isEqualTo(Amount(-600, "USD"))
        assertThat(importData.totals.single().operation).isEqualTo(Amount(-500, "USD"))
        assertThat(importData.valid).isFalse()
    }

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

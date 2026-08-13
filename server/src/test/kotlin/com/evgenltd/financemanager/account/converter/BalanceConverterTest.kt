package com.evgenltd.financemanager.account.converter

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.common.util.Amount
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import java.time.LocalDate
import java.util.UUID

class BalanceConverterTest {

    private val accountRepository = mock<com.evgenltd.financemanager.account.repository.AccountRepository>()
    private val accountConverter = AccountConverter(accountRepository)
    private val converter = BalanceConverter(accountConverter)

    private val account = Account(id = UUID.randomUUID(), name = "Bank", type = AccountType.ACCOUNT)

    @Test
    fun `toRecord - maps id, account, amount and date`() {
        val balance = Balance(
            id = UUID.randomUUID(),
            account = account,
            amount = Amount(1000000L, "USD"),
            date = LocalDate.of(2024, 1, 1),
        )

        val record = converter.toRecord(balance)

        assertThat(record.id).isEqualTo(balance.id)
        assertThat(record.account.id).isEqualTo(account.id)
        assertThat(record.amount).isEqualTo(Amount(1000000L, "USD"))
        assertThat(record.date).isEqualTo(LocalDate.of(2024, 1, 1))
    }

    @Test
    fun `toCommonRecord - duplicates amount into commonAmount`() {
        val balance = Balance(
            id = UUID.randomUUID(),
            account = account,
            amount = Amount(500000L, "EUR"),
            date = LocalDate.of(2024, 2, 1),
        )

        val record = converter.toCommonRecord(balance)

        assertThat(record.account.id).isEqualTo(account.id)
        assertThat(record.amount).isEqualTo(Amount(500000L, "EUR"))
        assertThat(record.commonAmount).isEqualTo(Amount(500000L, "EUR"))
    }
}

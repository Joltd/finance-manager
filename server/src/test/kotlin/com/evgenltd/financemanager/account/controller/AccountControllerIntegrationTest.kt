package com.evgenltd.financemanager.account.controller

import com.evgenltd.financemanager.AbstractIntegrationTest
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.record.AccountBalanceRecord
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.account.record.AccountReferenceRecord
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.testsupport.ApiResponse
import com.evgenltd.financemanager.testsupport.fixture.accountRecordOf
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpStatus
import java.time.LocalDate

class AccountControllerIntegrationTest : AbstractIntegrationTest() {

    @BeforeEach
    fun setUp() {
        cleanupTestData()
    }

    @Test
    fun `list - filters accounts by type`() {
        withTenant {
            accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT))
            accountRepository.save(Account(name = "Food", type = AccountType.EXPENSE))
        }

        val response = restClient.get()
            .uri("/api/v1/account?type=EXPENSE")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<AccountRecord>>>() {})

        assertThat(response!!.body).extracting("name").containsExactly("Food")
    }

    @Test
    fun `listReference - filters accounts by name mask`() {
        withTenant {
            accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT))
            accountRepository.save(Account(name = "Savings", type = AccountType.ACCOUNT))
        }

        val response = restClient.get()
            .uri("/api/v1/account/reference?mask=ban")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<AccountReferenceRecord>>>() {})

        assertThat(response!!.body).extracting("name").containsExactly("Bank")
    }

    @Test
    fun `byId - returns a single account`() {
        val account = withTenant { accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT)) }

        val response = restClient.get()
            .uri("/api/v1/account/${account.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<AccountRecord>>() {})

        assertThat(response!!.body!!.name).isEqualTo("Bank")
    }

    @Test
    fun `update - creates a new account when the record has no id`() {
        val response = restClient.post()
            .uri("/api/v1/account")
            .headers { it.addAll(authHeaders()) }
            .body(AccountRecord(id = null, name = "Food", type = AccountType.EXPENSE, parser = null, deleted = false, reviseDate = null))
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        withTenant { assertThat(accountRepository.findAll()).extracting("name").containsExactly("Food") }
    }

    @Test
    fun `update - modifies an existing account in place`() {
        val account = withTenant { accountRepository.save(Account(name = "Old", type = AccountType.ACCOUNT)) }

        restClient.post()
            .uri("/api/v1/account")
            .headers { it.addAll(authHeaders()) }
            .body(accountRecordOf(account).copy(name = "New"))
            .retrieve()
            .toEntity(String::class.java)

        withTenant { assertThat(accountRepository.find(account.id!!).name).isEqualTo("New") }
    }

    @Test
    fun `delete - hard deletes an unreferenced account`() {
        val account = withTenant { accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT)) }

        val response = restClient.delete()
            .uri("/api/v1/account/${account.id}")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .toEntity(String::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        withTenant { assertThat(accountRepository.findById(account.id!!)).isEmpty() }
    }

    @Test
    fun `listBalance - excludes zero balances when hideZeroBalances is set`() {
        withTenant {
            val withBalance = accountRepository.save(Account(name = "Bank", type = AccountType.ACCOUNT))
            val withoutBalance = accountRepository.save(Account(name = "Empty", type = AccountType.ACCOUNT))
            balanceRepository.save(Balance(account = withBalance, amount = Amount(1_000_000L, "USD"), date = LocalDate.of(2024, 1, 1)))
            balanceRepository.save(Balance(account = withoutBalance, amount = Amount(0L, "USD"), date = LocalDate.of(2024, 1, 1)))
        }

        val response = restClient.get()
            .uri("/api/v1/account/balance?hideZeroBalances=true")
            .headers { it.addAll(authHeaders()) }
            .retrieve()
            .body(object : ParameterizedTypeReference<ApiResponse<List<AccountBalanceRecord>>>() {})

        assertThat(response!!.body).extracting("account.name").containsExactly("Bank")
    }
}

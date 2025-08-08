package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.isNotZero
import com.evgenltd.financemanager.common.repository.like
import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.record.AccountGroupEntryRecord
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.account.record.AccountBalanceFilter
import com.evgenltd.financemanager.account.record.AccountBalanceGroupRecord
import com.evgenltd.financemanager.account.record.AccountBalanceRecord
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.turnover.entity.Balance
import com.evgenltd.financemanager.turnover.repository.BalanceRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class AccountService(
    private val accountRepository: AccountRepository,
    private val accountConverter: AccountConverter,
    private val balanceRepository: BalanceRepository,
    private val accountEventService: AccountEventService,
) {

    fun listReference(mask: String?, type: AccountType?): List<AccountRecord> {
        val filter = (Account::type eq type) and (Account::name like mask)
        val pageable = PageRequest.of(0, 20, Sort.by(Account::name.name))
        return accountRepository.findAll(filter, pageable)
            .content
            .map { accountConverter.toRecord(it) }
    }

    fun listBalances(filter: AccountBalanceFilter): List<AccountBalanceGroupRecord> {
        val balances = balanceRepository.findAll(Balance::amount.isNotZero().takeIf { filter.hideZeroBalances })
            .groupBy { it.account }
            .mapValues { it.value.map { balance -> balance.amount } }

        return accountRepository.findAll((Account::type eq AccountType.ACCOUNT))
            .groupBy { it.group }
            .map { (group, accounts) ->
                AccountBalanceGroupRecord(
                    id = group?.id,
                    name = group?.name,
                    accounts = accounts.map {
                        AccountBalanceRecord(
                            id = it.id!!,
                            name = it.name,
                            balances = balances[it] ?: emptyList(),
                        )
                    }.filter { !filter.hideZeroBalances || it.balances.isNotEmpty() }
                        .sortedBy { it.name }
                )
            }
            .filter { it.accounts.isNotEmpty() }
            .sortedBy { it.name ?: "z" }
    }

    fun byId(id: UUID): AccountRecord = accountRepository.find(id).let { accountConverter.toRecord(it) }

    fun byIdOrNull(id: UUID): Account? = accountRepository.findByIdOrNull(id)

    @Transactional
    fun update(record: AccountRecord): AccountRecord {
        val entity = accountConverter.toEntity(record)
        val saved = accountRepository.save(entity)
        accountEventService.accountBalance()
        return accountConverter.toRecord(saved)
    }

    @Transactional
    fun delete(id: UUID) {
        val account = accountRepository.findAndLock(id) ?: return
        account.deleted = true
        accountEventService.accountBalance()
    }

}
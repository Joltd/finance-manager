package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.isNotZero
import com.evgenltd.financemanager.common.repository.like
import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.record.AccountRecord
import com.evgenltd.financemanager.account.record.AccountBalanceFilter
import com.evgenltd.financemanager.account.record.AccountBalanceGroupRecord
import com.evgenltd.financemanager.account.record.AccountBalanceRecord
import com.evgenltd.financemanager.account.record.AccountReferenceRecord
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.account.entity.Balance
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.common.component.SkipLogging
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
@SkipLogging
class AccountService(
    private val accountRepository: AccountRepository,
    private val accountConverter: AccountConverter,
    private val accountEventService: AccountEventService,
    private val balanceRepository: BalanceRepository,
) {

    fun listReference(mask: String?, type: AccountType?): List<AccountReferenceRecord> {
        val filter = (Account::type eq type) and (Account::name like mask)
        val pageable = PageRequest.of(0, 20, Sort.by(Account::name.name))
        return accountRepository.findAll(filter, pageable)
            .content
            .map { accountConverter.toReference(it) }
    }

    fun list(type: AccountType?): List<AccountRecord> = accountRepository.findAll((Account::type eq type), Sort.by(Account::name.name))
        .map { accountConverter.toRecord(it) }

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
                            account = accountConverter.toReference(it),
                            balances = balances[it] ?: emptyList(),
                        )
                    }.filter { !filter.hideZeroBalances || it.balances.isNotEmpty() }
                        .sortedBy { it.account.name }
                )
            }
            .filter { it.accounts.isNotEmpty() }
            .sortedWith(compareBy({ if (it.id == null) 1 else 0 }, { it.name }))
    }

    fun byId(id: UUID): AccountRecord = accountRepository.find(id).let { accountConverter.toRecord(it) }

    fun byIdOrNull(id: UUID): Account? = accountRepository.findByIdOrNull(id)

    @Transactional
    fun update(record: AccountRecord): AccountRecord = record.id
        ?.let { accountRepository.findByIdOrNull(it) }
        .let { accountConverter.fillEntity(it, record) }
        .let { accountRepository.save(it) }
        .let { accountConverter.toRecord(it) }
        .also { accountEventService.account() }

    fun delete(id: UUID) {
        try {
            val account = accountRepository.find(id)
            accountRepository.delete(account)
        } catch (e: Exception) {
            val account = accountRepository.find(id)
            account.deleted = true
            accountRepository.save(account)
        }
        accountEventService.account()
    }

}

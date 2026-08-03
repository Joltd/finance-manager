package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.account.converter.AccountConverter
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.record.*
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.repository.and
import com.evgenltd.financemanager.common.repository.contains
import com.evgenltd.financemanager.common.repository.emptySpecification
import com.evgenltd.financemanager.common.repository.eq
import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.common.repository.like
import com.evgenltd.financemanager.common.util.isNotZero
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

    fun listReference(mask: String?, type: AccountType?, ids: List<UUID>? = null): List<AccountReferenceRecord> {
        val filter = (Account::type eq type) and (Account::name like mask) and (Account::deleted eq false) and (Account::id contains ids)
        return accountRepository.findAll(filter, Sort.by(Account::name.name))
            .map { accountConverter.toAccountReference(it) }
    }

    fun list(type: AccountType?): List<AccountRecord> = accountRepository.findAll((Account::type eq type), Sort.by(Account::name.name))
        .map { accountConverter.toRecord(it) }

    fun listBalances(filter: AccountBalanceFilter): List<AccountBalanceRecord> {
        val balances = balanceRepository.findAll()
            .groupBy { it.account }
            .mapValues {
                it.value
                    .map { balance -> balance.amount }
                    .filter { balance -> balance.isNotZero() }
            }

        val spec = (Account::type eq AccountType.ACCOUNT) and
            (Account::name like filter.name) and
            (if (filter.showDeleted) emptySpecification() else (Account::deleted eq false))

        return accountRepository.findAll(spec, Sort.by(Account::name.name))
            .map {
                AccountBalanceRecord(
                    account = accountConverter.toAccountReference(it),
                    balances = balances[it] ?: emptyList(),
                )
            }
            .filter { !filter.hideZeroBalances || it.balances.isNotEmpty() }
    }

    fun byId(id: UUID): AccountRecord = accountRepository.find(id).let { accountConverter.toRecord(it) }

    fun byIdOrNull(id: UUID): Account? = accountRepository.findByIdOrNull(id)

    @Transactional
    fun update(record: AccountRecord): AccountRecord = record.id
        ?.let { accountRepository.findByIdOrNull(it) }
        .let { accountConverter.fillEntity(it, record) }
        .let { accountRepository.save(it) }
        .let { accountConverter.toRecord(it) }
//        .also { accountEventService.account() }

    fun delete(id: UUID) {
        try {
            val account = accountRepository.find(id)
            accountRepository.delete(account)
        } catch (e: Exception) {
            val account = accountRepository.find(id)
            account.deleted = true
            accountRepository.save(account)
        }
//        accountEventService.account()
    }

}

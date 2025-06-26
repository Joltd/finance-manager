package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.reference.converter.AccountGroupConverter
import com.evgenltd.financemanager.reference.entity.AccountType
import com.evgenltd.financemanager.reference.record.AccountBalanceRecord
import com.evgenltd.financemanager.reference.repository.AccountRepository
import com.evgenltd.financemanager.turnover.service.TurnoverService
import org.springframework.stereotype.Service

@Service
class AccountBalanceService(
    private val accountRepository: AccountRepository,
    private val accountGroupConverter: AccountGroupConverter,
    private val turnoverService: TurnoverService,
) {

    fun balances(): List<AccountBalanceRecord> {
        val accounts = accountRepository.findByType(AccountType.ACCOUNT)
        val turnover = turnoverService.sliceLast()

        return accounts.map {
            AccountBalanceRecord(
                id = it.id!!,
                name = it.name,
                group = it.group?.let { group -> accountGroupConverter.toRecord(group) },
                balances = turnover[it]
                    ?.values
                    ?.map { turnover -> turnover.cumulativeAmount }
                    ?.filter { balance -> balance.isNotZero() }
                    ?: emptyList()
            )
        }
    }

}
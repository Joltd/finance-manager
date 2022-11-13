package com.evgenltd.financemanager.transaction.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.service.AccountService
import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import com.evgenltd.financemanager.transaction.entity.Direction
import com.evgenltd.financemanager.transaction.repository.AccountTransactionRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class AccountTransactionService(
        private val accountTransactionRepository: AccountTransactionRepository,
        private val accountService: AccountService
) {

    fun input(
            date: LocalDate,
            amount: Amount,
            document: String,
            account: String
    ) = save(date, Direction.IN, amount, document, account)

    fun output(
            date: LocalDate,
            amount: Amount,
            document: String,
            account: String
    ) = save(date, Direction.OUT, amount, document, account)

    private fun save(
            date: LocalDate,
            direction: Direction,
            amount: Amount,
            document: String,
            account: String
    ) {
        val transaction = AccountTransaction(null, date, direction, amount, document, account)
        accountTransactionRepository.save(transaction)
        accountService.updateActualOn(account, date)
    }

    fun findTransactionByAccount(account: String): List<AccountTransaction> =
            accountTransactionRepository.findByAccount(account)

}
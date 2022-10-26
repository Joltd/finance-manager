package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.AccountTransaction
import org.springframework.data.mongodb.repository.MongoRepository

interface AccountTransactionRepository : MongoRepository<AccountTransaction, String> {

    fun findByAccount(account: String): List<AccountTransaction>

    fun findByAccountNotNull(): List<AccountTransaction>

}
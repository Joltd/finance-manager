package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.Transaction
import org.springframework.data.mongodb.repository.MongoRepository

interface TransactionRepository : MongoRepository<Transaction, String> {

    fun deleteByDocument(document: String)

}
package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.Transaction
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query

interface TransactionRepository : MongoRepository<Transaction, String>
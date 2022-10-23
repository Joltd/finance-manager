package com.evgenltd.financemanager.document.repository

import com.evgenltd.financemanager.document.entity.DocumentExchange
import org.springframework.data.mongodb.repository.MongoRepository

interface DocumentExchangeRepository : MongoRepository<DocumentExchange, String> {
}
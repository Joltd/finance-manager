package com.evgenltd.financemanager.document.repository

import com.evgenltd.financemanager.document.entity.DocumentIncome
import org.springframework.data.mongodb.repository.MongoRepository

interface DocumentIncomeRepository : MongoRepository<DocumentIncome, String> {}
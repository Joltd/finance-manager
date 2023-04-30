package com.evgenltd.financemanager.document.repository

import com.evgenltd.financemanager.document.entity.DocumentExpense
import org.springframework.data.mongodb.repository.MongoRepository

interface DocumentExpenseRepository : MongoRepository<DocumentExpense, String>
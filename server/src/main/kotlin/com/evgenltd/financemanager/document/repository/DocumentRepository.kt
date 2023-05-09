package com.evgenltd.financemanager.document.repository

import com.evgenltd.financemanager.document.entity.Document
import org.springframework.data.mongodb.repository.MongoRepository

interface DocumentRepository : MongoRepository<Document,String> {}
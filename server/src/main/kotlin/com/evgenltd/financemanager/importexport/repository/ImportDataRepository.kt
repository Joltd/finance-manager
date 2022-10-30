package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportData
import org.springframework.data.mongodb.repository.MongoRepository

interface ImportDataRepository : MongoRepository<ImportData, String>
package com.evgenltd.financemanager.importdata.repository

import com.evgenltd.financemanager.importdata.entity.ImportData
import org.springframework.data.mongodb.repository.MongoRepository

interface ImportDataRepository : MongoRepository<ImportData, String>
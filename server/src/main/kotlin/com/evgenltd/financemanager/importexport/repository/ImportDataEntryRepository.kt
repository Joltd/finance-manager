package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import org.springframework.data.mongodb.repository.MongoRepository

interface ImportDataEntryRepository : MongoRepository<ImportDataEntry, String>
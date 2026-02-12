package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataTotal
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

@Repository
interface ImportDataTotalRepository : JpaRepository<ImportDataTotal, UUID>, JpaSpecificationExecutor<ImportDataTotal> {

    fun findByImportData(importData: ImportData): List<ImportDataTotal>

}
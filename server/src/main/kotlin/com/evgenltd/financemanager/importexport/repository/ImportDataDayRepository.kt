package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataDay
import com.evgenltd.financemanager.importexport.record.ImportDataDateRange
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ImportDataDayRepository : JpaRepository<ImportDataDay, UUID>, JpaSpecificationExecutor<ImportDataDay> {

    @Query("select min(ide.date) as min, max(ide.date) as max from ImportDataDay ide where ide.importData = :importData")
    fun findImportDataDateRange(importData: ImportData): ImportDataDateRange?

}
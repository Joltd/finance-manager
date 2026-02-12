package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.record.ImportDataDateRange
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface ImportDataEntryRepository : JpaRepository<ImportDataEntry,UUID>, JpaSpecificationExecutor<ImportDataEntry> {

    @Query("select ide.id from ImportDataEntry ide where ide.importDataDay.importData.id = :id")
    fun findByImportDataId(id: UUID): List<UUID>

    fun existsByImportDataDayImportDataAndOperationId(importData: ImportData, operationId: UUID): Boolean

    fun findByIdInAndVisible(ids: List<UUID>, visible: Boolean): List<ImportDataEntry>

}
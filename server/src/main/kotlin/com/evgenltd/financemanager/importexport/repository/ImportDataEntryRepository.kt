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

    @Query("select ide.id from ImportDataEntry ide where ide.importData.id = :id")
    fun findByImportDataId(id: UUID): List<UUID>

    fun existsByImportDataAndOperationId(importData: ImportData, operationId: UUID): Boolean

    @Query("select min(ide.date) as min, max(ide.date) as max from ImportDataEntry ide where ide.importData = :importData")
    fun findImportDataDateRange(importData: ImportData): ImportDataDateRange?

    fun findByIdInAndVisible(ids: List<UUID>, visible: Boolean): List<ImportDataEntry>

    @Query("select ide.operation.id from ImportDataEntry ide where ide.importData = :importData and ide.operation != null")
    fun findLinkedOperations(importData: ImportData): List<UUID>

}
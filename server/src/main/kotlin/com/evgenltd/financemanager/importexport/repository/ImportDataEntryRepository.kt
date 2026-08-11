package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.record.ImportDataDateRange
import org.springframework.data.jpa.repository.EntityGraph
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

    @Query("select ide from ImportDataEntry ide where ide.id = :id and ide.importDataDay.importData.id = :importDataId")
    fun findByIdAndImportDataId(id: UUID, importDataId: UUID): ImportDataEntry?

    @Query("select ide from ImportDataEntry ide where ide.id in :ids and ide.importDataDay.importData.id = :importDataId")
    fun findAllByIdInAndImportDataId(ids: List<UUID>, importDataId: UUID): List<ImportDataEntry>

    @EntityGraph(attributePaths = ["operations"])
    @Query("select ide from ImportDataEntry ide where ide.id in :ids and ide.importDataDay.importData.id = :importDataId")
    fun findAllByIdInAndImportDataIdFetchOperations(ids: List<UUID>, importDataId: UUID): List<ImportDataEntry>

    @Query("select ide from ImportDataEntry ide where ide.id in :ids and ide.visible = :visible and ide.importDataDay.importData.id = :importDataId")
    fun findByIdInAndVisibleAndImportDataId(ids: List<UUID>, visible: Boolean, importDataId: UUID): List<ImportDataEntry>

}
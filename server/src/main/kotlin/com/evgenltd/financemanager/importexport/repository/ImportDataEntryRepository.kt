package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.operation.entity.OperationData
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface ImportDataEntryRepository : JpaRepository<ImportDataEntry,UUID>, JpaSpecificationExecutor<ImportDataEntry> {

    @Query("select ide.id from ImportDataEntry ide where ide.importDataDay.importData.id = :id")
    fun findByImportDataId(id: UUID): List<UUID>

    @Query("select ide.operationData from ImportDataEntry ide where ide.id in :ids and ide.operationData.hint is null")
    fun findOperationDataWithoutHint(ids: List<UUID>): List<OperationData>

}

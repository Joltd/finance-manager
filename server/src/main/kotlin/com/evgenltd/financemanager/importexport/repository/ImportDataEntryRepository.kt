package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportOption
import com.evgenltd.financemanager.importexport.entity.ImportResult
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ImportDataEntryRepository : JpaRepository<ImportDataEntry,UUID>,JpaSpecificationExecutor<ImportDataEntry> {

    fun deleteByImportDataId(importDataId: UUID)

    fun findByIdIn(ids: List<UUID>): List<ImportDataEntry>

    @Query("select id from ImportDataEntry where importData.id = :importDataId and preparationResult = false")
    fun findForRepeatPreparation(importDataId: UUID): List<UUID>

    @Query("""
        select id from ImportDataEntry
        where
            importData.id = :importDataId
            and preparationResult = true 
            and option in (:options) 
            and importResult in (:importResults)
    """)
    fun findForStartImport(
        importDataId: UUID,
        options: List<ImportOption> = listOf(ImportOption.REPLACE, ImportOption.CREATE_NEW),
        importResults: List<ImportResult> = listOf(ImportResult.NOT_IMPORTED, ImportResult.FAILED)
    ): List<UUID>

}
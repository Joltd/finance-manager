package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportOption
import com.evgenltd.financemanager.importexport.entity.ImportResult
import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Modifying
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

    @Query("select ide from ImportDataEntry ide where ide.id = :id and ide.progress = :progress")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    fun findAndLock(id: UUID, progress: Boolean): ImportDataEntry?

    @Modifying
    @Query("update import_data_entries set progress = true where import_data_id = :importDataId and progress = false returning id", nativeQuery = true)
    fun lockAll(importDataId: UUID): List<UUID>

    @Modifying
    @Query("update import_data_entries set progress = false where id in (:ids) and progress = true", nativeQuery = true)
    fun unlock(ids: List<UUID>)

}
package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportDataOperation
import com.evgenltd.financemanager.importexport.entity.ImportDataOperationType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ImportDataOperationRepository : JpaRepository<ImportDataOperation, UUID> {

    @Query("""
        select ido from ImportDataOperation ido 
        where
            ido.importDataEntry.id in :entryIds
            and ido.importType = :importType
            and ido.hintInput is not null
            and ido.hint is null
    """)
    fun findForHintEmbedding(entryIds: List<UUID>, importType: ImportDataOperationType): List<ImportDataOperation>

    @Query("""
        select ido from ImportDataOperation ido 
        where
            ido.importDataEntry.id in :ids
            and ido.full is null
    """)
    fun findForFullEmbedding(ids: List<UUID>): List<ImportDataOperation>

    @Query("""
        select ido from ImportDataOperation ido
        where
            ido.importDataEntry.id in :ids
            and ido.importType = :importType
            and ido.hint is not null
    """)
    fun findForInterpretation(ids: List<UUID>, importType: ImportDataOperationType): List<ImportDataOperation>

}
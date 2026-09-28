package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.record.AccountScore
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

    @Query("""
        select ide from ImportDataEntry ide
        where ide.importDataDay.importData.id = :id
            and ide.type is not null
            and ide.operationData.hint is not null
    """)
    fun findForSuggestions(id: UUID): List<ImportDataEntry>

    @Query("""
        select ide from ImportDataEntry ide
        where ide.importDataDay.importData.id = :id
    """)
    fun findEntriesByImportDataId(id: UUID): List<ImportDataEntry>

    @Query("""
        select
            top_similar.account_id,
            sum(1.0 / (top_similar.distance + 1e-5)) as score
        from (
            select
                case
                    when o.account_from_id = imported.account_id then o.account_to_id
                    when o.account_to_id = imported.account_id then o.account_from_id
                end as account_id,
                (import_embedding.vector <-> operation_embedding.vector) as distance
            from import_data_entries entry
            join operation_data import_operation_data on entry.operation_data_id = import_operation_data.id
            join embeddings import_embedding on import_operation_data.hint_id = import_embedding.id
            join import_data_day day on entry.import_data_day_id = day.id
            join import_data imported on day.import_data_id = imported.id
            join operations o on (o.account_from_id = imported.account_id or o.account_to_id = imported.account_id)
                and o.type = entry.type
                and o.date >= current_date - interval '1 year'
            join operation_data existing_operation_data on o.operation_data_id = existing_operation_data.id
            join embeddings operation_embedding on existing_operation_data.hint_id = operation_embedding.id
            where entry.id = :entryId
            order by distance
            limit 50
        ) as top_similar
        where top_similar.account_id is not null
        group by top_similar.account_id
        order by score desc, top_similar.account_id
        limit 5
    """, nativeQuery = true)
    fun findSimilarAccountsByHint(entryId: UUID): List<AccountScore>

}

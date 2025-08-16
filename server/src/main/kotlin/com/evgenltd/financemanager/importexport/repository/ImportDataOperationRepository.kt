package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportDataOperation
import com.evgenltd.financemanager.importexport.entity.ImportDataOperationType
import com.evgenltd.financemanager.importexport.record.AccountScore
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
            and ido.importType = :importType
            and ido.hint is not null
    """)
    fun findForInterpretation(ids: List<UUID>, importType: ImportDataOperationType): List<ImportDataOperation>

    @Query("""
        select
            top_similar.account_id,
            sum(1.0 / (top_similar.distance + 1e-5)) as score
        from (
            select
                case
                    when o.account_from_id = idt.account_id then o.account_to_id
                    when o.account_to_id = idt.account_id then o.account_from_id
                end as account_id,
                (idoe.vector <-> oe.vector) as distance
            from import_data_operations ido
            join embeddings idoe on ido.hint_id = idoe.id
            left join import_data_entries ide on ido.import_data_entry_id = ide.id
            left join import_data idt on ide.import_data_id = idt.id
            left join operations o on (o.account_from_id = idt.account_id or o.account_to_id = idt.account_id)
                            and (o.date >= current_date - interval '6 months')
                            and o.type = ido.type
            join embeddings oe on o.hint_id = oe.id
            where
                ido.id = :operationId
            order by
                distance
            limit 50
        ) as top_similar
        group by
            top_similar.account_id
        order by
            score desc
        limit 5
    """, nativeQuery = true)
    fun findSimilarAccountsByHint(operationId: UUID): List<AccountScore>

}
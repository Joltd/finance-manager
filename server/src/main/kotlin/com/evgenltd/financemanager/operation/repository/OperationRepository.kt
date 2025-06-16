package com.evgenltd.financemanager.operation.repository

import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.record.AccountScore
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

@Repository
interface OperationRepository : JpaRepository<Operation,UUID>, JpaSpecificationExecutor<Operation> {

    fun findByDate(date: LocalDate): List<Operation>

//    @Query("""
//        select o.id, a.name account, o.description, (o.embedding <#> cast(:embedding as vector)) similarity
//        from operations o
//        left join accounts a on o.account_to_id = a.id
//        order by (o.embedding <-> cast(:embedding as vector)) desc
//        limit 20
//    """, nativeQuery = true)
//    fun findByEmbedding(embedding: String): List<TestResult>
//
//    @Query("""
//        select o.id, a.name account, o.description, (o.embedding <#> cast(:embedding as vector)) similarity
//        from operations o
//        left join accounts a on o.account_to_id = a.id
//        where
//            o.id <> :id
//        order by similarity
//        limit 20
//    """, nativeQuery = true)
//    fun findByEmbeddingExclude(embedding: String, id: UUID): List<TestResult>

    @Query("""
        select 
            top_similar.account_id,
            sum(1.0 / (top_similar.distance + 1e-5)) as score
        from (
            select
                case
                    when o.type = 'INCOME' then o.account_from_id
                    when o.type = 'EXPENSE' then o.account_to_id
                end as account_id,
                (h.vector <-> e.vector) as distance
            from operations o
            join embeddings h on o.hint_id = h.id
            join embeddings e on e.id = :embedding
            where
                (o.account_from_id = :account or o.account_to_id = :account)
                and o.type = :type
                and o.date >= current_date - interval '6 months'
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
    fun findSimilarByHint(account: UUID, type: String, embedding: UUID): List<AccountScore>

}
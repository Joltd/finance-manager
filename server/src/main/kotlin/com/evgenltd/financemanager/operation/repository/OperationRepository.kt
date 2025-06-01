package com.evgenltd.financemanager.operation.repository

import com.evgenltd.financemanager.importexport.tests.TestResult
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.record.SimilarOperation
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
        select o.*, (h.vector <-> e.vector) distance
        from operations o
        left join embeddings h on o.hint_id = h.id
        left join embedding e on e.id = :embedding
        where
            (o.account_from_id = :account or o.account_to_id = :account)
            and o.type = :type
            and o.date >= current_date - interval '6 months'
        order by
            distance
        limit 50
    """, nativeQuery = true)
    fun findSimilarByHint(account: UUID, type: OperationType, embedding: UUID): List<SimilarOperation>

}
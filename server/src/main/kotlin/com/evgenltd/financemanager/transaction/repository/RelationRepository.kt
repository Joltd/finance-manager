package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.Relation
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import java.time.LocalDate

interface RelationRepository : MongoRepository<Relation, String> {

    fun deleteByDateGreaterThanAndExchangeFalse(date: LocalDate)

    @Query("{'date': { \$gte: ?0, \$lt: ?1 }}")
    fun findByDateGreaterThanEqualAndDateLessThan(from: LocalDate, to: LocalDate): List<Relation>

    fun findByFromInOrToIn(fromIds: List<String>, toIds: List<String>): List<Relation>

    fun deleteByDocument(document: String)

}
package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.Relation
import org.springframework.data.mongodb.repository.MongoRepository
import java.time.LocalDate

interface RelationRepository : MongoRepository<Relation, String> {

    fun deleteByDateGreaterThanAndExchangeFalse(date: LocalDate)

}
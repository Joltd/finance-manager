package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.FundSnapshot
import org.springframework.data.mongodb.repository.MongoRepository
import java.time.LocalDate

interface FundSnapshotRepository : MongoRepository<FundSnapshot, String> {

    fun deleteByDateGreaterThanEqual(date: LocalDate)

    fun findFirstByOrderByDateDesc(): FundSnapshot?

    fun findFirstByDateLessThanOrderByDateDesc(date: LocalDate): FundSnapshot?

}
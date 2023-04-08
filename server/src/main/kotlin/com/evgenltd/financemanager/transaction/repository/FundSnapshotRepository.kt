package com.evgenltd.financemanager.transaction.repository

import com.evgenltd.financemanager.transaction.entity.FundSnapshot
import com.evgenltd.financemanager.transaction.entity.FundSnapshotType
import org.springframework.data.mongodb.repository.MongoRepository
import java.time.LocalDate

interface FundSnapshotRepository : MongoRepository<FundSnapshot, String> {

    fun deleteByDateGreaterThanEqualAndType(date: LocalDate, type: FundSnapshotType)

    fun findFirstByTypeOrderByDateDesc(type: FundSnapshotType): FundSnapshot?

    fun findByType(type: FundSnapshotType): FundSnapshot?

}
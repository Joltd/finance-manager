package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.account.entity.Account
import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ImportDataRepository : JpaRepository<ImportData,UUID> {

    @Query("select a from ImportData a where a.id = :id")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    fun findAndLock(id: UUID): ImportData?

    fun findByAccount(account: Account): List<ImportData>

}
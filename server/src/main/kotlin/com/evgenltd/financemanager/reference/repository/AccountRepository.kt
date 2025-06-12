package com.evgenltd.financemanager.reference.repository

import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.AccountType
import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface AccountRepository : JpaRepository<Account, UUID>,JpaSpecificationExecutor<Account> {

    @Query("select a from Account a where a.id = :id and a.deleted = false")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    fun findAndLock(id: UUID): Account?

    fun findByName(name: String): Account?

    fun findByTypeAndParserIsNotNull(type: AccountType): List<Account>

}
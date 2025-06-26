package com.evgenltd.financemanager.reference.repository

import com.evgenltd.financemanager.reference.entity.AccountGroup
import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface AccountGroupRepository : JpaRepository<AccountGroup, UUID>, JpaSpecificationExecutor<AccountGroup> {

    fun findByName(name: String): AccountGroup?

    fun findByNameLike(name: String): List<AccountGroup>
}
package com.evgenltd.financemanager.account.repository

import com.evgenltd.financemanager.account.entity.Account
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface AccountRepository : JpaRepository<Account, UUID>,JpaSpecificationExecutor<Account> {}
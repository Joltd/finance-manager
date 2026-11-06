package com.evgenltd.financemanager.account.repository

import com.evgenltd.financemanager.account.entity.Currency
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface CurrencyRepository : JpaRepository<Currency, UUID>, JpaSpecificationExecutor<Currency> {

    fun findByName(name: String): Currency
    fun findByTenantAndName(tenant: UUID, name: String): Currency?

}

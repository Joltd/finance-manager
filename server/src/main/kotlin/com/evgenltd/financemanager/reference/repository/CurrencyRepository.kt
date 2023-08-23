package com.evgenltd.financemanager.reference.repository

import com.evgenltd.financemanager.reference.entity.Currency
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface CurrencyRepository : JpaRepository<Currency, UUID> {

    fun findByNameLike(name: String): List<Currency>

}
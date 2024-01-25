package com.evgenltd.financemanager.taxes.repository

import com.evgenltd.financemanager.taxes.entity.Tax
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.UUID

@Repository
interface TaxRepository : JpaRepository<Tax, UUID> {

    fun findByDateGreaterThanEqualAndDateLessThanAndAmountCurrency(
        from: LocalDate,
        to: LocalDate,
        currency: String,
    ): List<Tax>

}
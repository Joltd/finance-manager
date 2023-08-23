package com.evgenltd.financemanager.operation.repository

import com.evgenltd.financemanager.operation.entity.Transaction
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.UUID

@Repository
interface TransactionRepository : JpaRepository<Transaction, UUID> {

    fun deleteByOperationId(id: UUID)

    fun findByDateGreaterThanEqualAndDateLessThan(from: LocalDate, to: LocalDate): List<Transaction>

}
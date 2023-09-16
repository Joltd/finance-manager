package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.OperationReviseEntry
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.UUID

@Repository
interface OperationReviseEntryRepository : JpaRepository<OperationReviseEntry,UUID> {

    fun findByOperationReviseId(operationReviseId: UUID): List<OperationReviseEntry>

    fun findByOperationReviseIdAndDate(operationReviseId: UUID, date: LocalDate): List<OperationReviseEntry>

    fun deleteByOperationReviseId(operationReviseId: UUID)

    fun deleteByOperationReviseIdAndDate(operationReviseId: UUID, date: LocalDate)

}
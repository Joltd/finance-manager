package com.evgenltd.financemanager.operation.repository

import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.reference.entity.Account
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

@Repository
interface OperationRepository : JpaRepository<Operation,UUID>, JpaSpecificationExecutor<Operation> {

    fun findByDate(date: LocalDate): List<Operation>

    fun findByAccountFromOrAccountTo(accountFrom: Account, accountTo: Account): List<Operation>

}
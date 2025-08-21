package com.evgenltd.financemanager.operation.repository

import com.evgenltd.financemanager.operation.entity.Operation
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface OperationRepository : JpaRepository<Operation,UUID>, JpaSpecificationExecutor<Operation> {

    fun findAllByOrderByDateDesc(page: Pageable): List<Operation>

}
package com.evgenltd.financemanager.operation.repository

import com.evgenltd.financemanager.operation.entity.Operation
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface OperationRepository : JpaRepository<Operation,UUID>, JpaSpecificationExecutor<Operation>
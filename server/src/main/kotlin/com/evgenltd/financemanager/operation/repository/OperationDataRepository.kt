package com.evgenltd.financemanager.operation.repository

import com.evgenltd.financemanager.operation.entity.OperationData
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface OperationDataRepository : JpaRepository<OperationData, UUID>

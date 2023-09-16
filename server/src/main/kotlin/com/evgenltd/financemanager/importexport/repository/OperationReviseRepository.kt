package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.OperationRevise
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface OperationReviseRepository : JpaRepository<OperationRevise,UUID> {
}
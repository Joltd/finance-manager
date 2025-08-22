package com.evgenltd.financemanager.exchangerate.repository

import com.evgenltd.financemanager.exchangerate.entity.ExchangeRateHistory
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import java.util.UUID

interface ExchangeRateHistoryRepository : JpaRepository<ExchangeRateHistory, UUID>, JpaSpecificationExecutor<ExchangeRateHistory> {
}
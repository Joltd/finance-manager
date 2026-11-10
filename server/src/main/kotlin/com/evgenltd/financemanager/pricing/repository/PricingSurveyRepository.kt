package com.evgenltd.financemanager.pricing.repository

import com.evgenltd.financemanager.pricing.entity.PricingSurvey
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface PricingSurveyRepository : JpaRepository<PricingSurvey, UUID>, JpaSpecificationExecutor<PricingSurvey>

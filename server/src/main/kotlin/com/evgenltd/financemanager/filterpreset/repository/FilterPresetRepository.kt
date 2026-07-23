package com.evgenltd.financemanager.filterpreset.repository

import com.evgenltd.financemanager.filterpreset.entity.FilterPreset
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface FilterPresetRepository : JpaRepository<FilterPreset, UUID>, JpaSpecificationExecutor<FilterPreset>

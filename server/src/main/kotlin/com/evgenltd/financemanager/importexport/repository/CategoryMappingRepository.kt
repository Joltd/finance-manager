package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.CategoryMapping
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface CategoryMappingRepository : JpaRepository<CategoryMapping, UUID>,JpaSpecificationExecutor<CategoryMapping> {
}
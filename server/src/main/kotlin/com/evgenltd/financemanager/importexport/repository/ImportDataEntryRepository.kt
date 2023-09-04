package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ImportDataEntryRepository : JpaRepository<ImportDataEntry,UUID>,JpaSpecificationExecutor<ImportDataEntry> {
}
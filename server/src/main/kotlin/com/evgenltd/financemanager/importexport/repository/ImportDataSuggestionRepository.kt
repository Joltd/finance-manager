package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportDataSuggestion
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ImportDataSuggestionRepository : JpaRepository<ImportDataSuggestion, UUID>

package com.evgenltd.financemanager.importexport.repository

import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.entity.ImportDataTotal
import com.evgenltd.financemanager.importexport.entity.ImportDataTotalType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

@Repository
interface ImportDataTotalRepository : JpaRepository<ImportDataTotal, UUID>, JpaSpecificationExecutor<ImportDataTotal> {

    fun findByImportDataAndDateIsNull(importData: ImportData): List<ImportDataTotal>

    fun findByImportDataAndDateIsNullAndType(importData: ImportData, type: ImportDataTotalType): List<ImportDataTotal>

    fun deleteByImportDataAndTypeIn(importData: ImportData, types: List<ImportDataTotalType>)

    fun deleteByImportDataAndDateInAndTypeIn(importData: ImportData, dates: List<LocalDate>, types: List<ImportDataTotalType>)

    fun deleteByImportDataAndDateIsNullAndTypeIn(importData: ImportData, types: List<ImportDataTotalType>)

}
package com.evgenltd.financemanager.operation.repository

import com.evgenltd.financemanager.operation.entity.Transaction
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.importexport.entity.ImportData
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

@Repository
interface TransactionRepository : JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {

    fun deleteByOperationId(operationId: UUID)

    fun findByAccountAndAmountCurrencyAndDateGreaterThanEqual(account: Account, currency: String, date: LocalDate): List<Transaction>

//    @Query("""
//        select t from Transaction t
//        where
//            t.account = :account
//            and t.date in :dates
//    """)
//    fun findForImportCalculation(importData: ImportData, account: Account, dates: Collection<LocalDate>): List<Transaction>

}
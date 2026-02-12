package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataOperation
import com.evgenltd.financemanager.importexport.entity.ImportDataOperationType
import com.evgenltd.financemanager.operation.entity.Operation

fun ImportDataEntry.parsed(): List<ImportDataOperation> = operations.filter { it.importType == ImportDataOperationType.PARSED }

fun ImportDataEntry.suggested(): List<ImportDataOperation> = operations.filter { it.importType == ImportDataOperationType.SUGGESTION }

fun ImportDataEntry.selectedSuggestion(): List<ImportDataOperation> = operations.filter { it.importType == ImportDataOperationType.SUGGESTION && it.selected }

fun ImportDataEntry.linked(): List<Operation> = operation?.let { listOf(it) } ?: emptyList()

fun List<ImportDataOperation>.amountsForAccount(account: Account): List<Amount> = flatMap { operation ->
    listOf(
        operation.amountFrom.takeIf { operation.accountFrom == account }?.let { -it },
        operation.amountTo.takeIf { operation.accountTo == account },
    )
}.filterNotNull()

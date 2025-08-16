package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataOperation
import com.evgenltd.financemanager.importexport.entity.ImportDataOperationType

fun ImportDataEntry.parsed(): ImportDataOperation? = operations.firstOrNull { it.importType == ImportDataOperationType.PARSED }

fun ImportDataEntry.suggested(): List<ImportDataOperation> = operations.filter { it.importType == ImportDataOperationType.SUGGESTION }

fun Sequence<ImportDataOperation>.amountsForAccount(account: Account): Sequence<Amount> = flatMap { operation ->
    listOf(
        operation.amountFrom.takeIf { operation.accountFrom == account }?.let { -it },
        operation.amountTo.takeIf { operation.accountTo == account },
    )
}.filterNotNull()

package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.importexport.entity.ImportDataEntry
import com.evgenltd.financemanager.importexport.entity.ImportDataOperation
import com.evgenltd.financemanager.importexport.entity.ImportDataOperationType
import com.evgenltd.financemanager.operation.entity.Operation
import com.evgenltd.financemanager.account.entity.Account

fun ImportDataEntry.parsed(): ImportDataOperation? = operations.firstOrNull { it.importType == ImportDataOperationType.PARSED }

fun ImportDataEntry.selectedSuggestion(): ImportDataOperation? = operations.firstOrNull { it.importType == ImportDataOperationType.SUGGESTION && it.selected }

fun Sequence<ImportDataOperation>.amountsForAccount(account: Account): Sequence<Amount> = flatMap { operation ->
    listOf(
        operation.amountFrom.takeIf { operation.accountFrom == account }?.let { -it },
        operation.amountTo.takeIf { operation.accountTo == account },
    )
}.filterNotNull()

fun Sequence<Operation>.amountsForAccount1(account: Account): Sequence<Amount> = flatMap { operation ->
    listOf(
        operation.amountFrom.takeIf { operation.accountFrom == account }?.let { -it },
        operation.amountTo.takeIf { operation.accountTo == account },
    )
}.filterNotNull()
package com.evgenltd.financemanager.report.record

import com.evgenltd.financemanager.account.record.AccountReferenceRecord
import com.evgenltd.financemanager.common.record.Reference
import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.operation.record.OperationRecord
import java.time.LocalDate

data class DashboardRecord(
    val accountBalances: List<AccountBalanceRecord>,
    val operations: List<OperationRecord>,
    val groupBalances: List<GroupBalanceRecord>,
    val topExpenses: List<TopExpenseRecord>,
    val incomeExpense: List<IncomeExpenseRecord>,
)

data class AccountBalanceRecord(
    val account: AccountReferenceRecord,
    val amounts: List<Amount>,
)

data class GroupBalanceRecord(
    val group: Reference,
    val amount: Amount,
)

data class TopExpenseRecord(
    val date: LocalDate,
    val expense1: Amount,
    val expense2: Amount,
    val expense3: Amount,
)

data class IncomeExpenseRecord(
    val date: LocalDate,
    val income: Amount,
    val expense: Amount,
)

//

data class DashboardRecordOld(
    val defaultCurrencyAmount: Amount,
    val usdCashAmount: Amount?,
    val cashFounds: List<Amount>
)
package com.evgenltd.financemanager.taxes.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.record.OperationFilter
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.service.OperationService
import com.evgenltd.financemanager.taxes.repository.TaxRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class TaxService(
    private val taxRepository: TaxRepository,
    private val operationService: OperationService,
) {

    fun getTotalYearTax(date: LocalDate, currency: String): Amount {
        val from = date.withDayOfYear(1)
        val to = date.withDayOfMonth(1)
        return taxRepository.findByDateGreaterThanEqualAndDateLessThanAndAmountCurrency(
            from = from,
            to = to,
            currency = currency,
        ).map { it.amount }
            .reduceOrNull { acc, amount -> acc + amount }
            ?: emptyAmount(currency)
    }

    fun getIncomeForMonth(date: LocalDate): List<OperationRecord> {
        val from = date.withDayOfMonth(1)
        val to = from.plusMonths(1)
        val filter = OperationFilter(
            dateFrom = from,
            dateTo = to,
            type = OperationType.INCOME,
        )
        return operationService.list(filter).operations
    }

}
package com.evgenltd.financemanager.taxes.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.common.util.emptyAmount
import com.evgenltd.financemanager.operation.entity.OperationType
import com.evgenltd.financemanager.operation.record.OperationFilter
import com.evgenltd.financemanager.operation.record.OperationRecord
import com.evgenltd.financemanager.operation.service.OperationService
import com.evgenltd.financemanager.taxes.entity.Tax
import com.evgenltd.financemanager.taxes.record.NewTax
import com.evgenltd.financemanager.taxes.repository.TaxRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class TaxService(
    private val taxRepository: TaxRepository,
    private val operationService: OperationService,
) {

    fun getYearBase(date: LocalDate, currency: String): Amount {
        val from = date.withDayOfYear(1)
        val to = date.withDayOfMonth(1)
        return taxRepository.findByDateGreaterThanEqualAndDateLessThanAndAmountCurrency(
            from = from,
            to = to,
            currency = currency,
        ).map { it.base }
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

    fun saveNewTax(newTax: NewTax) {
        val tax = Tax(
            id = null,
            date = newTax.date.withDayOfMonth(1),
            base = newTax.base,
            rate = newTax.rate,
            amount = newTax.amount,
        )
        taxRepository.save(tax)
    }

}
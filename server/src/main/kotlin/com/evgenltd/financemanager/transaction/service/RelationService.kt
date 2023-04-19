package com.evgenltd.financemanager.transaction.service

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.transaction.entity.Relation
import com.evgenltd.financemanager.transaction.entity.Transaction
import com.evgenltd.financemanager.transaction.repository.RelationRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class RelationService(
    private val relationRepository: RelationRepository
) {

    fun saveInToOutRelation(
        date: LocalDate,
        from: String,
        to: String,
        amount: Amount
    ) {
        val relation = Relation(
            id = null,
            date = date,
            from = from,
            to = to,
            exchange = false,
            amount = amount
        )
        relationRepository.save(relation)
    }

    fun saveExchangeRelation(
        date: LocalDate,
        from: Transaction,
        to: Transaction,
        document: String
    ) {
        val relation = Relation(
            id = null,
            date = date,
            from = from.id!!,
            to = to.id!!,
            document = document,
            exchange = true,
            rate = from.amount.toBigDecimal() / to.amount.toBigDecimal()
        )
        relationRepository.save(relation)
    }

    fun deleteByDocument(document: String) {
        relationRepository.deleteByDocument(document)
    }

    fun deleteNotActual(date: LocalDate) {
        relationRepository.deleteByDateGreaterThanAndExchangeFalse(date)
    }

    fun findRelations(from: LocalDate, to: LocalDate) =
        relationRepository.findByDateGreaterThanEqualAndDateLessThan(from, to)

    fun findRelations(transactionIds: List<String>) =
        relationRepository.findByFromInOrToIn(transactionIds, transactionIds)

}
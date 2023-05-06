package com.evgenltd.financemanager.transaction.service

import com.evgenltd.financemanager.transaction.entity.Fund
import com.evgenltd.financemanager.transaction.entity.GraphState
import com.evgenltd.financemanager.transaction.entity.GraphStatus
import com.evgenltd.financemanager.transaction.record.GraphStateRecord
import com.evgenltd.financemanager.transaction.repository.GraphStateRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class GraphStateService(
    private val graphStateRepository: GraphStateRepository,
    private val fundSnapshotService: FundSnapshotService
) {

    @Transactional
    fun loadState(): GraphStateRecord {
        val graphState = find()
        return GraphStateRecord(
            status = graphState.status,
            date = graphState.date,
            error = graphState.error,
            accounts = fundSnapshotService.asAccounts(graphState.fund)
        )
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun find(): GraphState = graphStateRepository.findAll().firstOrNull() ?: GraphState(
        id = null,
        date = MIN_DATE,
        status = GraphStatus.OUTDATED,
        error = null,
        fund = Fund()
    )

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun graphOutdated(fixationDate: LocalDate) {
        val state = find()
        state.date = fixationDate
        state.status = GraphStatus.OUTDATED
        state.error = null
        state.fund = Fund()
        graphStateRepository.save(state)
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun graphRebuild(date: LocalDate) {
        val state = find()
        state.date = date
        state.status = GraphStatus.REBUILD
        state.error = null
        graphStateRepository.save(state)
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun graphError(fund: Fund, error: String) {
        val state = find()
        state.status = GraphStatus.OUTDATED
        state.error = error
        state.fund = fund
        graphStateRepository.save(state)
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun graphActual(date: LocalDate, fund: Fund) {
        val state = find()
        state.date = date
        state.status = GraphStatus.ACTUAL
        state.error = null
        state.fund = fund
        graphStateRepository.save(state)
    }

    private companion object {
        val MIN_DATE: LocalDate = LocalDate.of(2000,1,1)
    }

}
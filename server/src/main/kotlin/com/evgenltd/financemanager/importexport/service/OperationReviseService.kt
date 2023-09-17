package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.importexport.converter.OperationReviseConverter
import com.evgenltd.financemanager.importexport.converter.OperationReviseEntryConverter
import com.evgenltd.financemanager.importexport.entity.OperationRevise
import com.evgenltd.financemanager.importexport.entity.OperationReviseDate
import com.evgenltd.financemanager.importexport.entity.OperationReviseEntry
import com.evgenltd.financemanager.importexport.record.OperationReviseEntryFilter
import com.evgenltd.financemanager.importexport.record.OperationReviseEntryRecord
import com.evgenltd.financemanager.importexport.record.OperationReviseRecord
import com.evgenltd.financemanager.importexport.repository.OperationReviseEntryRepository
import com.evgenltd.financemanager.importexport.repository.OperationReviseRepository
import com.evgenltd.financemanager.operation.converter.OperationConverter
import com.evgenltd.financemanager.operation.record.OperationFilter
import com.evgenltd.financemanager.operation.service.OperationService
import com.evgenltd.financemanager.reference.converter.AccountConverter
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.InputStream
import java.util.UUID

@Service
class OperationReviseService(
    private val operationReviseRepository: OperationReviseRepository,
    private val operationReviseEntryRepository: OperationReviseEntryRepository,
    private val operationReviseConverter: OperationReviseConverter,
    private val operationReviseEntryConverter: OperationReviseEntryConverter,
    private val operationService: OperationService,
    private val importParserService: ImportParserService,
    private val accountConverter: AccountConverter,
    private val operationConverter: OperationConverter
) {

    fun list(): List<OperationReviseRecord> = operationReviseRepository.findAll()
        .map { operationReviseConverter.toRecord(it) }

    fun entryList(id: UUID, filter: OperationReviseEntryFilter): List<OperationReviseEntryRecord> =
        operationReviseEntryRepository.findByOperationReviseIdAndDate(id, filter.date)
            .filter { !filter.hideMatched || it.operation == null || it.parsedEntry == null }
            .map { operationReviseEntryConverter.toRecord(it) }

    fun byId(id: UUID): OperationReviseRecord =
        operationReviseRepository.find(id).let { operationReviseConverter.toRecord(it) }

    @Transactional
    fun updateDate(id: UUID, date: OperationReviseDate) {
        val operationRevise = operationReviseRepository.find(id)
        operationRevise.dates = operationRevise.dates
            .map {
                if (it.date == date.date) {
                    date
                } else {
                    it
                }
            }
    }

    @Transactional
    fun delete(id: UUID) {
        operationReviseEntryRepository.deleteByOperationReviseId(id)
        operationReviseRepository.deleteById(id)
    }

    @Transactional
    fun newRevise(record: OperationReviseRecord, file: InputStream) {
        val operationRevise = operationReviseRepository.save(operationReviseConverter.toEntity(record))
        val operationReviseEntries = prepareRevise(operationRevise, file)
        performRevise(operationRevise, operationReviseEntries)
    }

    @Transactional
    fun repeatRevise(id: UUID) {
        val operationRevise = operationReviseRepository.find(id)
        val operationReviseEntries = operationReviseEntryRepository.findByOperationReviseId(id)
        performRevise(operationRevise, operationReviseEntries)
    }

    private fun prepareRevise(operationRevise: OperationRevise, file: InputStream): List<OperationReviseEntry> {
        val parser = importParserService.resolve(operationRevise.parser) ?: throw IllegalArgumentException("Parser not found")
        return parser.parse(null, file)
            .map {
                OperationReviseEntry(
                    operationRevise = operationRevise,
                    date = it.date,
                    parsedEntry = it,
                )
            }
            .onEach { operationReviseEntryRepository.save(it) }
    }

    private fun performRevise(operationRevise: OperationRevise, entries: List<OperationReviseEntry>) {
        val actualEntries = entries.toMutableList()
        for (entry in entries) {
            if (entry.parsedEntry == null) {
                operationReviseEntryRepository.delete(entry)
                actualEntries.remove(entry)
            } else {
                entry.operation = null
            }
        }

        val usedOperations = mutableSetOf<UUID>()
        val account = accountConverter.toReference(operationRevise.account)
        var pageNumber = 0
        while (true) {

            val filter = OperationFilter(
                page = pageNumber++,
                dateFrom = operationRevise.dateFrom,
                dateTo = operationRevise.dateTo,
                currency = operationRevise.currency,
                account = account
            )
            val page = operationService.list(filter)
            if (page.operations.isEmpty()) {
                break
            }

            for (operation in page.operations) {
                if (operation.id in usedOperations) {
                    continue
                }
                usedOperations.add(operation.id!!)

                val operationReviseEntry = actualEntries.find {
                    val parsedEntry = it.parsedEntry
                    parsedEntry != null
                            && it.operation == null
                            && parsedEntry.date == operation.date
                            && parsedEntry.amountFrom == operation.amountFrom
                            && parsedEntry.amountTo == operation.amountTo
                }

                if (operationReviseEntry != null) {
                    operationReviseEntry.operation = operationConverter.toEntity(operation)
                } else {
                    val newEntry = OperationReviseEntry(
                        operationRevise = operationRevise,
                        date = operation.date,
                        operation = operationConverter.toEntity(operation),
                        parsedEntry = null,
                    )
                    operationReviseEntryRepository.save(newEntry)
                    actualEntries.add(newEntry)
                }

            }

        }

        val previousState = operationRevise.dates.associateBy { it.date }
        operationRevise.dates = actualEntries.groupBy { it.date }
            .entries
            .map {
                OperationReviseDate(
                    date = it.key,
                    revised = it.value.all { entry -> entry.operation != null && entry.parsedEntry != null },
                    hidden = previousState[it.key]?.hidden ?: false
                )
            }
            .sortedBy { it.date }
    }

}
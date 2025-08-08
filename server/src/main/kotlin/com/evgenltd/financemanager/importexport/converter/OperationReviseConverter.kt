package com.evgenltd.financemanager.importexport.converter

import com.evgenltd.financemanager.importexport.entity.OperationRevise
import com.evgenltd.financemanager.importexport.record.OperationReviseRecord
import com.evgenltd.financemanager.account.converter.AccountConverter
import org.springframework.stereotype.Service

@Service
class OperationReviseConverter(
    private val accountConverter: AccountConverter,
    private val importParserConverter: ImportParserConverter
) {

    fun toRecord(entity: OperationRevise): OperationReviseRecord = OperationReviseRecord(
        id = entity.id!!,
        dateFrom = entity.dateFrom,
        dateTo = entity.dateTo,
        currency = entity.currency,
        account = accountConverter.toRecord(entity.account),
        parser = importParserConverter.toReference(entity.parser),
        dates = entity.dates
    )

    fun toEntity(record: OperationReviseRecord): OperationRevise = OperationRevise(
        id = record.id,
        dateFrom = record.dateFrom,
        dateTo = record.dateTo,
        currency = record.currency,
        account = accountConverter.toEntity(record.account),
        parser = record.parser.id,
        dates = record.dates
    )

}
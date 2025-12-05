package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.account.record.BalanceUpdateEvent
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service

@Service
class ImportDataAccountBalanceListener(
    private val importDataRepository: ImportDataRepository,
    private val importDataProcessService: ImportDataProcessService,
) {

    @EventListener
    fun accountBalanceChanged(event: BalanceUpdateEvent) {
        importDataRepository.findByAccountId(event.accountId)
            .onEach {
                importDataProcessService.calculateTotal(it.id!!, event.date)
            }
    }

}
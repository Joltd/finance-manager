package com.evgenltd.financemanager.user.service

import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.account.repository.BalanceRepository
import com.evgenltd.financemanager.account.repository.CurrencyRepository
import com.evgenltd.financemanager.account.repository.TurnoverRepository
import com.evgenltd.financemanager.filterpreset.repository.FilterPresetRepository
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.operation.repository.OperationRepository
import com.evgenltd.financemanager.operation.repository.TransactionRepository
import com.evgenltd.financemanager.settings.repository.SettingRepository
import com.evgenltd.financemanager.tag.repository.TagRepository
import com.evgenltd.financemanager.user.component.currentTenant
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class DemoDataCleanupService(
    private val importDataRepository: ImportDataRepository,
    private val transactionRepository: TransactionRepository,
    private val operationRepository: OperationRepository,
    private val balanceRepository: BalanceRepository,
    private val turnoverRepository: TurnoverRepository,
    private val accountRepository: AccountRepository,
    private val tagRepository: TagRepository,
    private val currencyRepository: CurrencyRepository,
    private val filterPresetRepository: FilterPresetRepository,
    private val settingRepository: SettingRepository,
) {

    @Transactional
    fun wipeTenant(tenant: UUID) {
        check(currentTenant() == tenant) { "wipeTenant($tenant) must be called inside withTenant($tenant)" }

        importDataRepository.deleteAll(importDataRepository.findAll())
        transactionRepository.deleteAll(transactionRepository.findAll())
        operationRepository.deleteAll(operationRepository.findAll())
        balanceRepository.deleteAll(balanceRepository.findAll())
        turnoverRepository.deleteAll(turnoverRepository.findAll())
        accountRepository.deleteAll(accountRepository.findAll())
        tagRepository.deleteAll(tagRepository.findAll())
        currencyRepository.deleteAll(currencyRepository.findAll())
        filterPresetRepository.deleteAll(filterPresetRepository.findAll())
        settingRepository.deleteAll(settingRepository.findAll())
    }

}

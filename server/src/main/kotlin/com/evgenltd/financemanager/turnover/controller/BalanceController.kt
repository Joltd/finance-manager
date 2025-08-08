package com.evgenltd.financemanager.turnover.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.turnover.record.BalanceRecord
import com.evgenltd.financemanager.turnover.service.BalanceEventService
import com.evgenltd.financemanager.turnover.service.BalanceService
import org.springframework.context.ApplicationEventPublisher
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@DataResponse
class BalanceController(
    private val balanceService: BalanceService,

    private val balanceEventService: BalanceEventService,
    private val accountRepository: AccountRepository,
    private val publisher: ApplicationEventPublisher,
) {

    @GetMapping("/balance")
    fun list(): List<BalanceRecord> = balanceService.list()

}
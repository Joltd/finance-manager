package com.evgenltd.financemanager.account.controller

import com.evgenltd.financemanager.common.component.DataResponse
import com.evgenltd.financemanager.account.record.BalanceRecord
import com.evgenltd.financemanager.account.record.CalculateBalanceData
import com.evgenltd.financemanager.account.repository.AccountRepository
import com.evgenltd.financemanager.account.service.BalanceActionService
import com.evgenltd.financemanager.account.service.BalanceService
import com.evgenltd.financemanager.common.repository.find
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID

@RestController
@DataResponse
class BalanceController(
    private val balanceService: BalanceService,
    private val balanceActionService: BalanceActionService,
    private val accountRepository: AccountRepository,
) {

    @PostMapping("/test")
    fun test(@RequestParam accountId: UUID, @RequestParam currency: String, @RequestParam date: LocalDate) {
        balanceActionService.updateBalance(accountId, currency, date)
    }

    @GetMapping("/balance")
    fun list(): List<BalanceRecord> = balanceService.list()

}
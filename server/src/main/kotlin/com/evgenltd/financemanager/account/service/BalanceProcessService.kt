package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.util.Loggable
import org.springframework.stereotype.Service

@Service
class BalanceProcessService(
    private val balanceActionService: BalanceActionService,
) : Loggable() {}
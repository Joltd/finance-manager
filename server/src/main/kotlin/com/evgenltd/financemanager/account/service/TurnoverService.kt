package com.evgenltd.financemanager.account.service

import com.evgenltd.financemanager.common.util.Loggable
import com.evgenltd.financemanager.entity.record.EntityFilterNodeRecord
import com.evgenltd.financemanager.entity.service.ConditionBuilderService
import com.evgenltd.financemanager.entity.service.EntityService
import com.evgenltd.financemanager.account.entity.Account
import com.evgenltd.financemanager.account.entity.AccountType
import com.evgenltd.financemanager.account.entity.Turnover
import com.evgenltd.financemanager.account.repository.TurnoverRepository
import org.springframework.stereotype.Service

@Service
class TurnoverService(
    private val turnoverRepository: TurnoverRepository,
    private val conditionBuilderService: ConditionBuilderService,
    private val entityService: EntityService,
) : Loggable() {

    fun listByAccountType(): List<Turnover> = turnoverRepository.findByAccountType(AccountType.ACCOUNT)

    fun listByAccount(account: Account): List<Turnover> {
        return turnoverRepository.findByAccount(account)
    }

    fun list(filter: EntityFilterNodeRecord): List<Turnover> {
        val javaType = entityService.fields(Turnover::class.java)
        return turnoverRepository.findAll { root, _, cb ->
            conditionBuilderService.build(filter, javaType, root, cb)
        }
    }
}
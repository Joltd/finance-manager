package com.evgenltd.financemanager.reference.service

import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class ReferenceService(
    private val accountRepository: AccountRepository
) {

    fun accountIndex(): Map<UUID, Account> = accountRepository.findAll().associateBy { it.id!! }

}
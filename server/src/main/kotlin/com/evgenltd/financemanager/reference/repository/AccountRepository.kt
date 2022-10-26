package com.evgenltd.financemanager.reference.repository

import com.evgenltd.financemanager.reference.entity.Account
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.repository.findByIdOrNull

interface AccountRepository : MongoRepository<Account,String> {

    fun findByNameLike(name: String): List<Account>

}

fun AccountRepository.name(id: String): String = findByIdOrNull(id)?.name ?: id

fun AccountRepository.nameOrNull(id: String?): String? = id?.let(::findByIdOrNull)?.name
package com.evgenltd.financemanager.reference.repository

import com.evgenltd.financemanager.reference.entity.Account
import org.springframework.data.mongodb.repository.MongoRepository

interface AccountRepository : MongoRepository<Account,String> {

    fun findByNameLike(name: String): List<Account>

    fun findByName(name: String): Account?

}
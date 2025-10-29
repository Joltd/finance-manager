package com.evgenltd.financemanager.user.repository

import com.evgenltd.financemanager.user.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import java.util.UUID

interface UserRepository : JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    fun findByLoginAndDeletedIsFalse(login: String): User?

}
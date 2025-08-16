package com.evgenltd.financemanager.settings.repository

import com.evgenltd.financemanager.settings.entity.Setting
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface SettingRepository : JpaRepository<Setting, UUID> {

    fun findByName(name: String): Setting?

}
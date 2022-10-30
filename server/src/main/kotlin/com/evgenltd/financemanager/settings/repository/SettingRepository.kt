package com.evgenltd.financemanager.settings.repository

import com.evgenltd.financemanager.settings.entity.Setting
import org.springframework.data.mongodb.repository.MongoRepository

interface SettingRepository : MongoRepository<Setting,String>
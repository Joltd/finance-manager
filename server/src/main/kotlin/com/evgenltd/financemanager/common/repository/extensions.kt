package com.evgenltd.financemanager.common.repository

import org.springframework.data.mongodb.repository.MongoRepository
import kotlin.reflect.KMutableProperty0

inline fun <reified T,ID : Any> MongoRepository<T,ID>.find(id: ID): T = findById(id).orElseThrow { IllegalArgumentException("${T::class.java.simpleName} [$id] not found") }

fun <V> KMutableProperty0<V?>.nonNull() = get() ?: throw IllegalArgumentException("[${name}] is not specified")

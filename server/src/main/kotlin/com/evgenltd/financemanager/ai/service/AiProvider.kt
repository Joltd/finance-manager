package com.evgenltd.financemanager.ai.service

import com.evgenltd.financemanager.ai.service.provider.Provider

interface AiProvider {

    val name: Provider

    fun embedding(data: List<String>): List<FloatArray>
}
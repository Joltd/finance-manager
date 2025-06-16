package com.evgenltd.financemanager.ai.service

import com.evgenltd.financemanager.ai.service.provider.Provider
import org.springframework.stereotype.Service

@Service
class AiProviderResolver(
    private val providers: List<AiProvider>,
) {

    fun resolve(): AiProvider = providers.first { it.name == Provider.STUB }

}
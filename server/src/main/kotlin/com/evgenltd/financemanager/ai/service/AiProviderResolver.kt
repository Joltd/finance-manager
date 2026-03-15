package com.evgenltd.financemanager.ai.service

import com.evgenltd.financemanager.ai.service.provider.AiProviders
import org.springframework.stereotype.Service

@Service
class AiProviderResolver(
    private val providers: List<AiProvider>,
) {

    fun resolve(): AiProvider = providers.first { it.name == AiProviders.OPEN_AI }

}
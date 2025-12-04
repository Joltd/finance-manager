package com.evgenltd.financemanager.ai.service.provider

import com.evgenltd.financemanager.ai.record.EmbeddingResult
import com.evgenltd.financemanager.ai.service.AiProvider
import org.springframework.stereotype.Service
import java.nio.ByteBuffer
import java.security.MessageDigest
import kotlin.random.Random

@Service
class AiStubProvider : AiProvider {

    override val name: AiProviders = AiProviders.STUB

    override fun embedding(data: List<String>): List<EmbeddingResult> = data.map { stubEmbedding(it) }

    private fun stubEmbedding(text: String): EmbeddingResult {
        val hash = DIGEST.digest(text.toByteArray())
        val seedBytes = hash.take(4).toByteArray()
        val seed = ByteBuffer.wrap(seedBytes).int
        val random = Random(seed)
        return EmbeddingResult(
            input = text,
            vector = FloatArray(1536) { random.nextFloat() }
        )
    }

    private companion object {
        val DIGEST: MessageDigest = MessageDigest.getInstance("SHA-256")
    }

}
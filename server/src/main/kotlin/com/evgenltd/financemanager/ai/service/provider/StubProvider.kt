package com.evgenltd.financemanager.ai.service.provider

import com.evgenltd.financemanager.ai.service.AiProvider
import org.springframework.stereotype.Service
import java.nio.ByteBuffer
import java.security.MessageDigest
import kotlin.random.Random

@Service
class StubProvider : AiProvider {

    override val name: Provider = Provider.STUB

    override fun embedding(data: List<String>): List<FloatArray> = data.map { stubEmbedding(it) }

    private fun stubEmbedding(text: String): FloatArray {
        val hash = DIGEST.digest(text.toByteArray())
        val seedBytes = hash.take(4).toByteArray()
        val seed = ByteBuffer.wrap(seedBytes).int
        val random = Random(seed)
        return FloatArray(1536) { random.nextFloat() }
    }

    private companion object {
        val DIGEST: MessageDigest = MessageDigest.getInstance("SHA-256")
    }

}
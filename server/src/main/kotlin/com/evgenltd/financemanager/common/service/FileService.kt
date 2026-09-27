package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.component.SkipLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.InputStream
import java.nio.file.Files
import java.nio.file.Paths
import java.util.*

@SkipLogging
@Service
class FileService(
    @Value("\${files}")
    private val path: String,
) {

    fun store(file: MultipartFile): String {
        val extension = file.originalFilename
            ?.substringAfterLast('/')
            ?.substringAfterLast('\\')
            ?.substringAfterLast('.', "")
            ?.takeIf { it.matches(SAFE_EXTENSION) }
            ?.lowercase()
        val filename = buildString {
            append(UUID.randomUUID())
            if (extension != null) {
                append('.')
                append(extension)
            }
        }
        val filePath = Paths.get(path).resolve(filename)
        Files.copy(file.inputStream, filePath)
        return filename
    }

    fun <T> load(file: String, block: (stream: InputStream) -> T): T {
        return Files.newInputStream(Paths.get(path).resolve(file)).use {
            block(it)
        }
    }

    @Scheduled(cron = "0 */5 * * * *")
    fun cleanup() {
        Files.list(Paths.get(path))
            .filter {
                try {
                    Files.getLastModifiedTime(it)
                        .toMillis() < System.currentTimeMillis() - 5 * 60_000
                } catch (e: Exception) {
                    false
                }
            }
            .forEach {
                try {
                    Files.deleteIfExists(it)
                } catch (e: Exception) {
                }
            }
    }

    private companion object {
        val SAFE_EXTENSION = Regex("[A-Za-z0-9]{1,10}")
    }
}

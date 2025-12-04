package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.component.SkipLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.InputStream
import java.nio.file.Files
import java.nio.file.Paths
import java.util.UUID

@SkipLogging
@Service
class FileService(
    @Value("\${files}")
    private val path: String,
) {

    fun store(file: MultipartFile): String {
        val filename = UUID.randomUUID().toString()
        val filePath = Paths.get(path).resolve(filename)
        Files.copy(file.inputStream, filePath)
        return filename
    }

    fun load(file: String, block: (stream: InputStream) -> Unit) {
        Files.newInputStream(Paths.get(path).resolve(file)).use {
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
}
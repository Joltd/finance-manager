package com.evgenltd.financemanager.common.service

import com.evgenltd.financemanager.common.component.SkipLogging
import com.evgenltd.financemanager.common.record.FileMetadata
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.http.MediaTypeFactory
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import tools.jackson.databind.ObjectMapper
import java.io.InputStream
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.*

@SkipLogging
@Service
class FileService(
    @Value("\${files}")
    private val path: String,
    private val mapper: ObjectMapper,
) {

    fun store(file: MultipartFile): String {
        val filename = UUID.randomUUID().toString()
        val originalFilename = file.originalFilename
            ?.replace('\\', '/')
            ?.substringAfterLast('/')
            ?.filterNot(Char::isISOControl)
            ?.trim()
            ?.takeLast(MAX_ORIGINAL_FILENAME_LENGTH)
            ?.takeIf { it.isNotBlank() && it != "." && it != ".." }
            ?: throw IllegalArgumentException("Uploaded file name is missing")
        val contentTypeValue = file.contentType
            ?.takeUnless { it.isBlank() || it.equals(MediaType.APPLICATION_OCTET_STREAM_VALUE, ignoreCase = true) }
            ?: MediaTypeFactory.getMediaType(originalFilename)
                .map(MediaType::toString)
                .orElseThrow { IllegalArgumentException("Unable to determine content type for [$originalFilename]") }
        val contentType = try {
            MediaType.parseMediaType(contentTypeValue).toString()
        } catch (e: Exception) {
            throw IllegalArgumentException("Invalid content type for [$originalFilename]", e)
        }

        val filePath = resolve(filename)
        val metadataPath = metadataPath(filename)
        Files.createDirectories(root())
        try {
            file.inputStream.use { Files.copy(it, filePath) }
            mapper.writeValue(metadataPath.toFile(), FileMetadata(originalFilename, contentType))
        } catch (e: Exception) {
            Files.deleteIfExists(filePath)
            Files.deleteIfExists(metadataPath)
            throw e
        }
        return filename
    }

    fun <T> load(file: String, block: (stream: InputStream) -> T): T {
        return Files.newInputStream(resolve(file)).use {
            block(it)
        }
    }

    fun metadata(file: String): FileMetadata {
        val metadataPath = metadataPath(file)
        if (!Files.isRegularFile(metadataPath)) {
            throw IllegalStateException("Metadata for stored file [$file] is missing")
        }
        return mapper.readValue(metadataPath.toFile(), FileMetadata::class.java)
    }

    fun <T> loadWithMetadata(file: String, block: (stream: InputStream, metadata: FileMetadata) -> T): T {
        val metadata = metadata(file)
        return load(file) { stream -> block(stream, metadata) }
    }

//    @Scheduled(cron = "0 */5 * * * *")
    fun cleanup() {
        val root = root()
        if (!Files.isDirectory(root)) {
            return
        }

        val expiration = System.currentTimeMillis() - 5 * 60_000
        Files.list(root).use { files ->
            files.filter { !it.fileName.toString().endsWith(METADATA_SUFFIX) }
                .filter { isExpired(it, expiration) }
                .forEach { payload ->
                    try {
                        Files.deleteIfExists(payload)
                        Files.deleteIfExists(metadataPath(payload.fileName.toString()))
                    } catch (_: Exception) {
                    }
                }
        }

        Files.list(root).use { files ->
            files.filter { it.fileName.toString().endsWith(METADATA_SUFFIX) }
                .filter { metadata ->
                    val payloadName = metadata.fileName.toString().removeSuffix(METADATA_SUFFIX)
                    !Files.exists(resolve(payloadName)) && isExpired(metadata, expiration)
                }
                .forEach {
                    try {
                        Files.deleteIfExists(it)
                    } catch (_: Exception) {
                    }
                }
        }
    }

    private fun root(): Path = Paths.get(path).toAbsolutePath().normalize()

    private fun resolve(file: String): Path = root().resolve(file).normalize()
        .takeIf { it.parent == root() }
        ?: throw IllegalArgumentException("Invalid stored file name [$file]")

    private fun metadataPath(file: String): Path = resolve("$file$METADATA_SUFFIX")

    private fun isExpired(file: Path, expiration: Long): Boolean = try {
        Files.getLastModifiedTime(file).toMillis() < expiration
    } catch (_: Exception) {
        false
    }

    private companion object {
        const val METADATA_SUFFIX = ".metadata.json"
        const val MAX_ORIGINAL_FILENAME_LENGTH = 255
    }
}

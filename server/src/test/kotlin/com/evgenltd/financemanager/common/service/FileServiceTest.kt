package com.evgenltd.financemanager.common.service

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.springframework.http.MediaType
import org.springframework.mock.web.MockMultipartFile
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.attribute.FileTime

class FileServiceTest {

    @TempDir
    lateinit var directory: Path

    private val mapper = jacksonObjectMapper()

    @Test
    fun `store persists payload and metadata and loads them together`() {
        val service = FileService(directory.toString(), mapper)
        val file = MockMultipartFile(
            "file",
            "folder\\statement.csv",
            "text/csv",
            "date,amount\n2026-01-01,10".toByteArray(),
        )

        val storedFilename = service.store(file)

        val metadata = service.metadata(storedFilename)
        assertThat(metadata.originalFilename).isEqualTo("statement.csv")
        assertThat(metadata.contentType).isEqualTo("text/csv")
        service.loadWithMetadata(storedFilename) { stream, loadedMetadata ->
            assertThat(stream.readAllBytes()).isEqualTo(file.bytes)
            assertThat(loadedMetadata).isEqualTo(metadata)
        }
        Files.list(directory).use { assertThat(it.count()).isEqualTo(2) }
    }

    @Test
    fun `store infers content type when upload uses octet stream`() {
        val service = FileService(directory.toString(), mapper)
        val file = MockMultipartFile(
            "file",
            "statement.pdf",
            MediaType.APPLICATION_OCTET_STREAM_VALUE,
            "%PDF".toByteArray(),
        )

        val storedFilename = service.store(file)

        assertThat(service.metadata(storedFilename).contentType).isEqualTo(MediaType.APPLICATION_PDF_VALUE)
    }

    @Test
    fun `metadata fails for legacy payload without sidecar`() {
        val service = FileService(directory.toString(), mapper)
        Files.writeString(directory.resolve("legacy"), "data")

        assertThatThrownBy { service.metadata("legacy") }
            .isInstanceOf(IllegalStateException::class.java)
            .hasMessageContaining("missing")
    }

    @Test
    fun `cleanup deletes expired payload and sidecar as a pair`() {
        val service = FileService(directory.toString(), mapper)
        val storedFilename = service.store(
            MockMultipartFile("file", "statement.csv", "text/csv", "data".toByteArray()),
        )
        val oldTime = FileTime.fromMillis(System.currentTimeMillis() - 10 * 60_000)
        Files.setLastModifiedTime(directory.resolve(storedFilename), oldTime)
        Files.setLastModifiedTime(directory.resolve("$storedFilename.metadata.json"), oldTime)

        service.cleanup()

        assertThat(directory.resolve(storedFilename)).doesNotExist()
        assertThat(directory.resolve("$storedFilename.metadata.json")).doesNotExist()
    }
}

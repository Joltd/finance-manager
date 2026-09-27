package com.evgenltd.financemanager.common.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.springframework.mock.web.MockMultipartFile
import java.nio.file.Path

class FileServiceTest {

    @TempDir
    lateinit var tempDir: Path

    @Test
    fun `store - preserves a safe extension and load returns unchanged bytes`() {
        val service = FileService(tempDir.toString())
        val content = "date,amount\n2026-01-01,10".toByteArray()

        val filename = service.store(MockMultipartFile("file", "bank.Export.CSV", "text/csv", content))
        val loaded = service.load(filename) { it.readAllBytes() }

        assertThat(filename).endsWith(".csv")
        assertThat(loaded).isEqualTo(content)
    }
}

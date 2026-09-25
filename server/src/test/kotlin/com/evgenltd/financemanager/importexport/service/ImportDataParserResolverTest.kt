package com.evgenltd.financemanager.importexport.service

import com.evgenltd.financemanager.importexport.service.parser.ImportParser
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class ImportDataParserResolverTest {

    @Test
    fun `resolve returns explicitly configured parser`() {
        val parser = mock<ImportParser>()
        whenever(parser.name).thenReturn("BANK")
        val resolver = ImportDataParserResolver(listOf(parser))

        assertThat(resolver.resolve("BANK")).isSameAs(parser)
    }

    @Test
    fun `resolve rejects null and unknown parser without AI fallback`() {
        val resolver = ImportDataParserResolver(emptyList())

        assertThatThrownBy { resolver.resolve(null) }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("not configured")
        assertThatThrownBy { resolver.resolve("UNKNOWN") }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("UNKNOWN")
    }
}

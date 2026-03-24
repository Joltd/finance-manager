package com.evgenltd.financemanager.common.component

import org.hibernate.type.descriptor.WrapperOptions
import org.hibernate.type.descriptor.java.JavaType
import org.hibernate.type.format.AbstractJsonFormatMapper
import tools.jackson.core.JsonGenerator
import tools.jackson.core.JsonParser
import tools.jackson.databind.ObjectMapper
import java.io.IOException
import java.lang.reflect.Type

class Jackson3JsonFormatMapper(
    private val objectMapper: ObjectMapper,
) : AbstractJsonFormatMapper() {

    companion object {
        const val SHORT_NAME = "jackson"
    }

    @Throws(IOException::class)
    override fun <T> writeToTarget(value: T, javaType: JavaType<T>, target: Any, options: WrapperOptions) {
        objectMapper.writerFor(objectMapper.constructType(javaType.javaType))
            .writeValue(target as JsonGenerator, value)
    }

    @Throws(IOException::class)
    override fun <T> readFromSource(javaType: JavaType<T>, source: Any, options: WrapperOptions): T =
        objectMapper.readValue(source as JsonParser, objectMapper.constructType(javaType.javaType))

    override fun supportsSourceType(sourceType: Class<*>): Boolean =
        JsonParser::class.java.isAssignableFrom(sourceType)

    override fun supportsTargetType(targetType: Class<*>): Boolean =
        JsonGenerator::class.java.isAssignableFrom(targetType)

    override fun <T> fromString(charSequence: CharSequence, type: Type): T =
        try {
            objectMapper.readValue(charSequence.toString(), objectMapper.constructType(type))
        } catch (e: Exception) {
            throw IllegalArgumentException("Could not deserialize string to java type: $type", e)
        }

    override fun <T> toString(value: T, type: Type): String =
        try {
            objectMapper.writerFor(objectMapper.constructType(type)).writeValueAsString(value)
        } catch (e: Exception) {
            throw IllegalArgumentException("Could not serialize object of java type: $type", e)
        }

}
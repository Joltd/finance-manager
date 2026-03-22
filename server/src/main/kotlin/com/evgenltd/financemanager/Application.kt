package com.evgenltd.financemanager

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer

@SpringBootApplication
@EnableConfigurationProperties
@ConfigurationPropertiesScan
class Application : SpringBootServletInitializer() {
//
//    @Bean
//    fun objectMapper(): ObjectMapper = ObjectMapper()
//
//    @Bean
//    fun hibernatePropertiesCustomizer(objectMapper: ObjectMapper): HibernatePropertiesCustomizer =
//        HibernatePropertiesCustomizer {
//            it[AvailableSettings.JSON_FORMAT_MAPPER] = JacksonJsonFormatMapper(objectMapper)
//        }

}

fun main(args: Array<String>) {
    runApplication<Application>(*args)
}

package com.evgenltd.financemanager

import com.evgenltd.financemanager.common.component.Jackson3JsonFormatMapper
import org.hibernate.cfg.AvailableSettings
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer
import org.springframework.boot.runApplication
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer
import org.springframework.context.annotation.Bean
import tools.jackson.databind.ObjectMapper

@SpringBootApplication
@EnableConfigurationProperties
@ConfigurationPropertiesScan
class Application : SpringBootServletInitializer() {

    @Bean
    fun hibernatePropertiesCustomizer(objectMapper: ObjectMapper): HibernatePropertiesCustomizer =
        HibernatePropertiesCustomizer {
            it[AvailableSettings.JSON_FORMAT_MAPPER] = Jackson3JsonFormatMapper(objectMapper)
        }

}

fun main(args: Array<String>) {
    runApplication<Application>(*args)
}

package com.evgenltd.financemanager.importexport.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class ImportDataProperties(
        @Value("\${import-data.directory}") val directory: String
)
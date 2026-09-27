package com.evgenltd.financemanager.importexport.entity

enum class ImportDataParsingStatus {
    CREATED,
    PARSING,
    PREPARATION,
    EMBEDDING,
    SUGGESTION,
    LINKING,
    CALCULATION,
    DONE,
    FAILED,
}

package com.evgenltd.financemanager.importexport.record

class ImportDataResult(val id: String, val entries: List<DocumentEntryResult>)

class DocumentEntryResult(val id: String, val result: Boolean, val message: String)
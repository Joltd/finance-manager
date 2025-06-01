package com.evgenltd.financemanager.importexport2.service

import com.evgenltd.financemanager.common.repository.find
import com.evgenltd.financemanager.importexport.entity.ImportData
import com.evgenltd.financemanager.importexport.repository.ImportDataRepository
import com.evgenltd.financemanager.importexport2.record.ImportDataCreateRequest
import com.evgenltd.financemanager.reference.repository.AccountRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ImportDataService(
    private val accountRepository: AccountRepository,
    private val importDataRepository: ImportDataRepository,
) {

    fun save(request: ImportDataCreateRequest): ImportData {
        val account = accountRepository.find(request.account)

        val importData = ImportData(account = account)
        return importDataRepository.save(importData)
    }

}
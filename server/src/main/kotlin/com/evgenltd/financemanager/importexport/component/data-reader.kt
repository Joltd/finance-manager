package com.evgenltd.financemanager.importexport.component

import com.evgenltd.financemanager.common.component.readCsv
import com.evgenltd.financemanager.importexport.record.RawDataRecord
import org.jsoup.Jsoup
import org.jsoup.nodes.Node
import java.io.File

fun readTinkoff(currency: String, path: String): List<RawDataRecord> = readCsv(path, ";")
        .filter { it[3].clean() == "OK" }
        .map {
            try {
                RawDataRecord(
                        it[0].clean().dateTime("dd.MM.yyyy HH:mm:ss"),
                        it[6].clean().amount(currency),
                        "${it[9].clean()}|${it[11].clean()}"
                )
            } catch (e: Exception) {
                throw e
            }
        }

private fun String.clean(): String = replace("\"", "")

fun readKaspi(currency: String = "KZT", path: String): List<RawDataRecord> = readCsv(path)
        .map {
            RawDataRecord(
                    it[0].date("dd.MM.yy"),
                    (it[1] + it[2].cleanAmount()).amount(currency),
                    "${it[3]}|${it[4]}"
            )
        }

private fun String.cleanAmount(): String = replace("₸", "").replace(" ", "")

fun readBcc(currency: String = "KZT", path: String): List<RawDataRecord> = Jsoup.parse(File(path))
        .select(".history__list__item")
        .map {
            val descriptionNode = it[1][1]
            val description = descriptionNode[0][0].toString().trim()
            val root = it[3][0]
            val sign = if (root[1].childNodeSize() > 0) {
                root[1][0].toString().trim()
            } else {
                root[2][0].toString().trim()
            }
            val amount = it[3][0][3].toString().trim().cleanAmount()
            RawDataRecord(
                    descriptionNode[1][0].toString().date("dd.MM.yyyy"),
                    (sign + amount).amount(currency),
                    description
            )
        }

private operator fun Node.get(index: Int): Node = childNode(index)
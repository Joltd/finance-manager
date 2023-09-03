package com.evgenltd.financemanager.importexport.entity

import com.evgenltd.financemanager.reference.entity.Account
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.criteria.Path
import jakarta.persistence.criteria.Root
import java.util.*

@Entity
@Table(name = "category_mappings")
class CategoryMapping(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    var parser: UUID,

    var pattern: String,

    @ManyToOne
    @JoinColumn(name = "category_id")
    var category: Account

) {

    companion object {
        fun parser(root: Root<CategoryMapping>): Path<String> = root.get(CategoryMapping::parser.name)

        fun categoryId(root: Root<CategoryMapping>): Path<UUID> = root.get<UUID?>(CategoryMapping::category.name).get(Account::id.name)
    }

}
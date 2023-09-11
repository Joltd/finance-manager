package com.evgenltd.financemanager.operation.entity

import com.evgenltd.financemanager.common.util.Amount
import com.evgenltd.financemanager.reference.entity.Account
import com.evgenltd.financemanager.reference.entity.AccountType
import jakarta.persistence.*
import jakarta.persistence.criteria.Path
import jakarta.persistence.criteria.Root
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "operations")
class Operation(

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null,

    var date: LocalDate,

    @Enumerated(EnumType.STRING)
    var type: OperationType,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "amount_from_value")),
        AttributeOverride(name = "currency", column = Column(name = "amount_from_currency")),
    )
    var amountFrom: Amount,

    @ManyToOne
    @JoinColumn(name = "account_from_id")
    var accountFrom: Account,

    @Embedded
    @AttributeOverrides(
        AttributeOverride(name = "value", column = Column(name = "amount_to_value")),
        AttributeOverride(name = "currency", column = Column(name = "amount_to_currency")),
    )
    var amountTo: Amount,

    @ManyToOne
    @JoinColumn(name = "account_to_id")
    var accountTo: Account,

    var description: String,
) {

    companion object {
        fun date(root: Root<Operation>): Path<LocalDate> = root.get(Operation::date.name)

        fun type(root: Root<Operation>): Path<OperationType> = root.get(Operation::type.name)

        fun accountFromId(root: Root<Operation>): Path<UUID> = root.get<Account>(Operation::accountFrom.name).get(Account::id.name)

        fun accountFromType(root: Root<Operation>): Path<AccountType> = root.get<Account>(Operation::accountFrom.name).get(Account::type.name)

        fun accountToId(root: Root<Operation>): Path<UUID> = root.get<Account>(Operation::accountTo.name).get(Account::id.name)

        fun accountToType(root: Root<Operation>): Path<AccountType> = root.get<Account>(Operation::accountTo.name).get(Account::type.name)

        fun currencyFrom(root: Root<Operation>): Path<String> = root.get<Amount>(Operation::amountFrom.name).get(Amount::currency.name)

        fun currencyTo(root: Root<Operation>): Path<String> = root.get<Amount>(Operation::amountTo.name).get(Amount::currency.name)
    }

}

enum class OperationType {
    EXPENSE,
    INCOME,
    EXCHANGE,
    TRANSFER,
}
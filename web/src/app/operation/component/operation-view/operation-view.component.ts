import {Component, Input} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Operation} from "../../model/operation";
import {Reference} from "../../../common/model/reference";
import {Account} from "../../../reference/model/account";
import * as moment from "moment";

@Component({
  selector: 'operation-view',
  templateUrl: './operation-view.component.html',
  styleUrls: ['./operation-view.component.scss']
})
export class OperationViewComponent {

  exchange: FormGroup = new FormGroup({
    date: new FormControl(null, Validators.required),
    amountFrom: new FormControl(null, Validators.required),
    accountFrom: new FormControl(null, Validators.required),
    amountTo: new FormControl(null, Validators.required),
    accountTo: new FormControl(null, Validators.required),
    description: new FormControl('')
  })
  transfer: FormGroup = new FormGroup({
    id: new FormControl(null),
    date: new FormControl(null, Validators.required),
    amount: new FormControl(null, Validators.required),
    accountFrom: new FormControl(null, Validators.required),
    accountTo: new FormControl(null, Validators.required),
    description: new FormControl('')
  })
  expense: FormGroup = new FormGroup({
    id: new FormControl(null),
    date: new FormControl(null, Validators.required),
    account: new FormControl(null, Validators.required),
    category: new FormControl(null, Validators.required),
    amount: new FormControl(null, Validators.required),
    description: new FormControl('')
  })
  income: FormGroup = new FormGroup({
    id: new FormControl(null),
    date: new FormControl(null, Validators.required),
    account: new FormControl(null, Validators.required),
    category: new FormControl(null, Validators.required),
    amount: new FormControl(null, Validators.required),
    description: new FormControl('')
  })

  _operation: Operation = {
    id: null,
    date: moment().format('YYYY-MM-DD'),
    type: 'EXCHANGE',
    accountFrom: null,
    amountFrom: null,
    accountTo: null,
    amountTo: null,
    description: ''
  } as any

  get operation(): Operation | null {
    if (this._operation?.type == 'EXCHANGE' && this.exchange.valid) {
      return {
        id: this._operation.id,
        date: this.exchange.value.date,
        type: 'EXCHANGE',
        accountFrom: this.referenceAsAccount(this.exchange.value.accountFrom, 'ACCOUNT'),
        amountFrom: this.exchange.value.amountFrom,
        accountTo: this.referenceAsAccount(this.exchange.value.accountTo, 'ACCOUNT'),
        amountTo: this.exchange.value.amountTo,
        description: this.exchange.value.description,
      }
    } else if (this._operation?.type == 'TRANSFER' && this.transfer.valid) {
      return {
        id: this._operation.id,
        date: this.transfer.value.date,
        type: 'TRANSFER',
        accountFrom: this.referenceAsAccount(this.transfer.value.accountFrom, 'ACCOUNT'),
        amountFrom: this.transfer.value.amount,
        accountTo: this.referenceAsAccount(this.transfer.value.accountTo, 'ACCOUNT'),
        amountTo: this.transfer.value.amount,
        description: this.transfer.value.description,
      }
    } else if (this._operation?.type == 'EXPENSE' && this.expense.valid) {
      return {
        id: this._operation.id,
        date: this.expense.value.date,
        type: 'EXPENSE',
        accountFrom: this.referenceAsAccount(this.expense.value.account, 'ACCOUNT'),
        amountFrom: this.expense.value.amount,
        accountTo: this.referenceAsAccount(this.expense.value.category, 'EXPENSE'),
        amountTo: this.expense.value.amount,
        description: this.expense.value.description,
      }
    } else if (this._operation?.type == 'INCOME' && this.income.valid) {
      return {
        id: this._operation.id,
        date: this.income.value.date,
        type: 'INCOME',
        accountFrom: this.referenceAsAccount(this.income.value.category, 'INCOME'),
        amountFrom: this.income.value.amount,
        accountTo: this.referenceAsAccount(this.income.value.account, 'ACCOUNT'),
        amountTo: this.income.value.amount,
        description: this.income.value.description,
      }
    } else {
      return null
    }
  }

  @Input()
  set operation(operation: Operation | null) {
    if (operation == null) {
      return
    } else if (operation.type == 'EXPENSE') {
      this._operation = operation
      this.expense.patchValue({
        date: operation.date,
        account: operation.accountFrom,
        category: operation.accountTo,
        amount: operation.amountFrom,
        description: operation.description
      })
    } else if (operation.type == 'INCOME') {
      this._operation = operation
      this.income.patchValue({
        date: operation.date,
        account: operation.accountTo,
        category: operation.accountFrom,
        amount: operation.amountFrom,
        description: operation.description
      })
    } else if (operation.type == 'TRANSFER') {
      this._operation = operation
      this.transfer.patchValue({
        date: operation.date,
        amount: operation.amountFrom,
        accountFrom: operation.accountFrom,
        accountTo: operation.accountTo,
        description: operation.description
      })
    } else if (operation.type == 'EXCHANGE') {
      this._operation = operation
      this.exchange.patchValue(operation)
    }
  }

  get valid(): boolean {
    return (this._operation?.type == 'EXCHANGE' && this.exchange.valid)
      || (this._operation?.type == 'TRANSFER' && this.transfer.valid)
      || (this._operation?.type == 'EXPENSE' && this.expense.valid)
      || (this._operation?.type == 'INCOME' && this.income.valid)
  }

  private referenceAsAccount(reference: Reference, type: 'EXPENSE' | 'INCOME' | 'ACCOUNT'): Account {
    return {
      id: reference.id,
      name: reference.name,
      type: type,
      deleted: reference.deleted
    }
  }

}

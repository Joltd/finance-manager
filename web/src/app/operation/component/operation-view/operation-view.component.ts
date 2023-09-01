import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Operation} from "../../model/operation";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {Reference} from "../../../common/model/reference";
import {Account} from "../../../reference/model/account";
import * as moment from "moment";

@Component({
  selector: 'operation-view',
  templateUrl: './operation-view.component.html',
  styleUrls: ['./operation-view.component.scss']
})
export class OperationViewComponent implements OnInit, OnDestroy {

  exchange: FormGroup = new FormGroup({
    id: new FormControl(null),
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
  expenseIncome: FormGroup = new FormGroup({
    id: new FormControl(null),
    date: new FormControl(null, Validators.required),
    account: new FormControl(null, Validators.required),
    category: new FormControl(null, Validators.required),
    amount: new FormControl(null, Validators.required),
    description: new FormControl('')
  })

  private _operation: Operation = {
    id: null,
    date: moment().format('YYYY-MM-DD'),
    type: 'EXCHANGE',
    accountFrom: null,
    amountFrom: null,
    accountTo: null,
    amountTo: null,
    description: ''
  } as any

  get operation(): Operation {
    return this._operation
  }

  @Input()
  set operation(operation: Operation | null) {
    if (operation == null) {
      return
    } else if (operation.type == 'EXPENSE') {
      this._operation = operation
      this.expenseIncome.patchValue({
        id: operation.id,
        date: operation.date,
        account: operation.accountFrom,
        category: operation.accountTo,
        amount: operation.amountFrom,
        description: operation.description
      })
    } else if (operation.type == 'INCOME') {
      this._operation = operation
      this.expenseIncome.patchValue({
        id: operation.id,
        date: operation.date,
        account: operation.accountTo,
        category: operation.accountFrom,
        amount: operation.amountFrom,
        description: operation.description
      })
    } else if (operation.type == 'TRANSFER') {
      this._operation = operation
      this.transfer.patchValue({
        id: operation.id,
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

  @Output()
  onSave: EventEmitter<Operation> = new EventEmitter<Operation>()

  @Output()
  onClose: EventEmitter<void> = new EventEmitter<void>()

  constructor(
    private toolbarService: ToolbarService
  ) {}

  ngOnInit(): void {
    this.toolbarService.setup('Operation', [
      { name: 'save', icon: 'done', action: () => this.save() },
      { name: 'close', icon: 'close', action: () => this.close() }
    ])
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
  }

  private save() {
    if (this._operation?.type == 'EXCHANGE' && this.exchange.valid) {
      this._operation = {
        id: this.exchange.value.id,
        date: this.exchange.value.date,
        type: 'EXCHANGE',
        accountFrom: this.referenceAsAccount(this.exchange.value.accountFrom, 'ACCOUNT'),
        amountFrom: this.exchange.value.amountFrom,
        accountTo: this.referenceAsAccount(this.exchange.value.accountTo, 'ACCOUNT'),
        amountTo: this.exchange.value.amountTo,
        description: this.exchange.value.description,
      }
      this.onSave.emit(this._operation)
    } else if (this._operation?.type == 'TRANSFER' && this.transfer.valid) {
      this._operation = {
        id: this.transfer.value.id,
        date: this.transfer.value.date,
        type: 'TRANSFER',
        accountFrom: this.referenceAsAccount(this.transfer.value.accountFrom, 'ACCOUNT'),
        amountFrom: this.transfer.value.amount,
        accountTo: this.referenceAsAccount(this.transfer.value.accountTo, 'ACCOUNT'),
        amountTo: this.transfer.value.amount,
        description: this.transfer.value.description,
      }
      this.onSave.emit(this._operation)
    } else if (this._operation?.type == 'EXPENSE' && this.expenseIncome.valid) {
      this._operation = {
        id: this.expenseIncome.value.id,
        date: this.expenseIncome.value.date,
        type: 'EXPENSE',
        accountFrom: this.referenceAsAccount(this.expenseIncome.value.account, 'ACCOUNT'),
        amountFrom: this.expenseIncome.value.amount,
        accountTo: this.referenceAsAccount(this.expenseIncome.value.category, 'EXPENSE'),
        amountTo: this.expenseIncome.value.amount,
        description: this.expenseIncome.value.description,
      }
      this.onSave.emit(this._operation)
    } else if (this._operation?.type == 'INCOME' && this.expenseIncome.valid) {
      this._operation = {
        id: this.expenseIncome.value.id,
        date: this.expenseIncome.value.date,
        type: 'INCOME',
        accountFrom: this.referenceAsAccount(this.expenseIncome.value.category, 'INCOME'),
        amountFrom: this.expenseIncome.value.amount,
        accountTo: this.referenceAsAccount(this.expenseIncome.value.account, 'ACCOUNT'),
        amountTo: this.expenseIncome.value.amount,
        description: this.expenseIncome.value.description,
      }
      this.onSave.emit(this._operation)
    }
  }

  private close() {
    this.onClose.emit()
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

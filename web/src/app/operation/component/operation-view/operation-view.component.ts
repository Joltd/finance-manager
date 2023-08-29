import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {isExpense, isIncome, Operation} from "../../model/operation";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {Reference} from "../../../common/model/reference";
import {Account} from "../../../reference/model/account";

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
  expenseIncome: FormGroup = new FormGroup({
    id: new FormControl(null),
    date: new FormControl(null, Validators.required),
    account: new FormControl(null, Validators.required),
    category: new FormControl(null, Validators.required),
    amount: new FormControl(null, Validators.required),
    description: new FormControl('')
  })

  private _operation: Operation | null = null
  type: 'EXCHANGE' | 'EXPENSE' | 'INCOME' = 'EXCHANGE'

  @Input()
  set operation(operation: Operation | null) {
    if (operation == null) {
      return
    }

    this._operation = operation
    if (isExpense(operation)) {
      this.type = 'EXPENSE'
      this.expenseIncome.patchValue({
        id: operation.id,
        date: operation.date,
        account: operation.accountFrom,
        category: operation.accountTo,
        amount: operation.amountFrom,
        description: operation.description
      })
    } else if (isIncome(operation)) {
      this.type = 'INCOME'
      this.expenseIncome.patchValue({
        id: operation.id,
        date: operation.date,
        account: operation.accountTo,
        category: operation.accountFrom,
        amount: operation.amountFrom,
        description: operation.description
      })
    } else {
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
    if (this.type == 'EXCHANGE' && this.exchange.valid) {
      this._operation = {
        id: this.exchange.value.id,
        date: this.exchange.value.date,
        accountFrom: this.referenceAsAccount(this.exchange.value.accountFrom, 'ACCOUNT'),
        amountFrom: this.exchange.value.amountFrom,
        accountTo: this.referenceAsAccount(this.exchange.value.accountTo, 'ACCOUNT'),
        amountTo: this.exchange.value.amountTo,
        description: this.exchange.value.description,
      }
      this.onSave.emit(this._operation)
    } else if (this.type == 'EXPENSE' && this.expenseIncome.valid) {
      this._operation = {
        id: this.expenseIncome.value.id,
        date: this.expenseIncome.value.date,
        accountFrom: this.referenceAsAccount(this.expenseIncome.value.account, 'ACCOUNT'),
        amountFrom: this.expenseIncome.value.amount,
        accountTo: this.referenceAsAccount(this.expenseIncome.value.category, 'EXPENSE'),
        amountTo: this.expenseIncome.value.amount,
        description: this.expenseIncome.value.description,
      }
      this.onSave.emit(this._operation)
    } else if (this.type == 'INCOME' && this.expenseIncome.valid) {
      this._operation = {
        id: this.expenseIncome.value.id,
        date: this.expenseIncome.value.date,
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

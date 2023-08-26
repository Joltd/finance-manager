import {Input, OnDestroy, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Operation} from "../../model/operation";
import {OperationService} from "../../service/operation.service";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Document} from "../../../document/model/document";

@Component({
  selector: 'operation-view',
  templateUrl: './operation-view.component.html',
  styleUrls: ['./operation-view.component.css']
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
    category: new FromControl(null, Validators.required),
    amount: new FormControl(null, Validators.required),
    description: new FormControl('')
  })

  private _operation!: Operation
  type: 'EXCHANGE' | 'EXPENSE' | 'INCOME' = 'EXCHANGE'

  @Input()
  set operation(operation: Operation) {
    this._operation = operation
    if (isExpense(operation)) {
      this.type = 'EXPENSE'
      this.expenseIncome.patch({
        id: operation.id,
        date: operation.date,
        account: operation.accountFrom,
        category: operation.accountTo,
        amount: operation.amountFrom,
        description: operation.description
      })
    } else if (isIncome(operation)) {
      this.type = 'INCOME'
      this.expenseIncome.patch({
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

  @Input()
  onSave!: (operation: Operation) => void

  @Input()
  onClose!: () => void

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

  onChangeType(type: 'EXCHANGE' | 'EXPENSE' | 'INCOME') {
    this.type = type
  }

  private save() {
    if (this.type == 'EXCHANGE' && this.exchange.valid) {
      this._operation.id = this.exchange.value.id
      this._operation.date = this.exchange.value.date
      this._operation.accountFrom = this.referenceAsAccount(this.exchange.value.accountFrom)
      this._operation.amountFrom = this.exchange.value.ammountFrom
      this._operation.accountTo = this.referenceAsAccount(this.exchange.value.accountTo)
      this._operation.amountTo = this.exchange.value.ammount
      this._operation.description = this.exchange.value.description
      this.onSave.emmit(_operation)
    } else if (this.type == 'EXPENSE' && this.expenseIncome.valid) {
      this._operation.id = this.expenseIncome.value.id
      this._operation.date = this.expenseIncome.value.date
      this._operation.accountFrom = this.referenceAsAccount(this.expenseIncome.value.account)
      this._operation.amountFrom = this.expenseIncome.value.ammount
      this._operation.accountTo = this.referenceAsAccount(this.expenseIncome.value.category)
      this._operation.amountTo = this.expenseIncome.value.ammount
      this._operation.description = this.expenseIncome.value.description
      this.onSave.emmit(_operation)
    } else if (this.type == 'INCOME' && this.expenseIncome.valid) {
      this._operation.id = this.expenseIncome.value.id
      this._operation.date = this.expenseIncome.value.date
      this._operation.accountFrom = this.referenceAsAccount(this.expenseIncome.value.category)
      this._operation.amountFrom = this.expenseIncome.value.amount
      this._operation.accountTo = this.referenceAsAccount(this.expenseIncome.value.account)
      this._operation.amountTo = this.expenseIncome.value.amount
      this._operation.description = this.expenseIncome.value.description
      this.onSave.emmit(_operation)
    }
  }

  private close() {
    this.onClose.emmit()
  }

  private referenceAsAccount(reference: Reference, type: 'EXCHANGE' | 'EXPENSE' | 'INCOME'): Account {
    return {
      id: reference.id,
      name: reference.name,
      type: type,
      deleted: reference.deleted
    }
  }

}

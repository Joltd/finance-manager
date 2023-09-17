import {Component, Input} from "@angular/core";
import {Operation} from "../../model/operation";
import * as moment from "moment";
import {Amount} from "../../../common/model/amount";

@Component({
  selector: 'operation-view',
  templateUrl: './operation-view.component.html',
  styleUrls: ['./operation-view.component.scss']
})
export class OperationViewComponent {

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
    return this._operation
  }

  @Input()
  set operation(operation: Operation | null) {
    if (operation == null) {
      this._operation = {
        date: moment().format('YYYY-MM-DD'),
        type: 'EXCHANGE'
      } as any
    } else {
      this._operation = {
        ...operation
      }
    }
  }

  get valid(): boolean {
    return this._operation.date != null
      && this._operation.type != null
      && this._operation.accountFrom != null
      && this._operation.amountFrom != null
      && this._operation.accountTo != null
      && this._operation.amountTo != null
  }

  onChangeAmountFrom(amount: Amount) {
    this._operation.amountFrom = amount
    if (this._operation.type != 'EXCHANGE') {
      this._operation.amountTo = amount
    }
  }

}

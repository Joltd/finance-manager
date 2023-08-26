import {Component, HostBinding, Input} from "@angular/core";
import {isExpense, isIncome, isExchange, Operation} from "../../model/operation";

@Component({
  selector: 'operation-label',
  templateUrl: './operation-label.component.html',
  styleUrls: ['./operation-label.component.css']
})
export class OperationLabelComponent {

  @Input()
  operation!: Operation

  @Input()
  @HostBinding('class.disabled')
  disabled: boolean = false

  @Input()
  hideDate: boolean = false

  isExpense(): boolean {
    return isExpense(this.operation)
  }

  isIncome(): boolean {
    return isIncome(this.operation)
  }

  isExchange(): boolean {
    return isExchange(this.operation)
  }

}

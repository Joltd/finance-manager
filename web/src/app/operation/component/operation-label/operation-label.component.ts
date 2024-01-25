import {Component, HostBinding, Input} from "@angular/core";
import {Operation} from "../../model/operation";

@Component({
  selector: 'operation-label',
  templateUrl: './operation-label.component.html',
  styleUrls: ['./operation-label.component.scss']
})
export class OperationLabelComponent {

  @Input()
  operation!: Operation

  @Input()
  @HostBinding('class.disabled')
  disabled: boolean = false

  @Input()
  hideDate: boolean = false

  @Input()
  hideAccount: boolean = false

  sameAmount(): boolean {
    return this.operation.amountFrom.currency == this.operation.amountTo.currency
      && this.operation.amountFrom.value == this.operation.amountTo.value
  }

}

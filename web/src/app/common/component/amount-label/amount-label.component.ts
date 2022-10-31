import {Component, Input} from "@angular/core";
import {Amount, toFractional} from "../../model/amount";

@Component({
  selector: 'amount-label',
  templateUrl: 'amount-label.component.html',
  styleUrls: ['amount-label.component.scss']
})
export class AmountLabelComponent {

  @Input()
  amount: Amount | null = null

  formatAmount(): string {
    if (this.amount == null) {
      return "0"
    } else {
      return ''+toFractional(this.amount)
    }
  }

}

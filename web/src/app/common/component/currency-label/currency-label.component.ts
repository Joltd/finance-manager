import {Component, Input} from "@angular/core";
import {CurrencyService} from "../../../reference/service/currency.service";
import {Currency} from "../../../reference/model/currency";

@Component({
  selector: 'currency-label',
  templateUrl: 'currency-label.component.html',
  styleUrls: ['currency-label.component.scss']
})
export class CurrencyLabelComponent {

  _currency: Currency | null = null

  @Input()
  set currency(currency: Currency | string | null) {
    if (typeof currency == 'string') {
      this._currency = this.currencyService
        .currencies
        .find(entry => entry.name == currency) || null
    } else {
      this._currency = currency || null
    }
  }

  @Input()
  full: boolean = false

  constructor(
    private currencyService: CurrencyService
  ) {}

}

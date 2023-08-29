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
  set currency(currency: string | null) {
    this._currency = this.currencyService.currencies.find(entry => entry.name == currency) || null
  }

  @Input()
  full: boolean = false

  constructor(
    private currencyService: CurrencyService
  ) {}

  formatCurrency(): string {
    switch (this._currency?.name) {
      case 'RUB': return 'fi-ru'
      case 'USD': return 'fi-us'
      case 'EUR': return 'fi-eu'
      case 'KZT': return 'fi-kz'
      case 'TRY': return 'fi-tr'
      case 'RSD': return 'fi-rs'
      case 'GEL': return 'fi-ge'
      default: return ''
    }
  }

  formatCryptoCurrency(): string {
    return 'cf-' + this._currency?.name?.toLowerCase()
  }

}

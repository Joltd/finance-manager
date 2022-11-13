import {Component, Input} from "@angular/core";

@Component({
  selector: 'currency-label',
  templateUrl: 'currency-label.component.html',
  styleUrls: ['currency-label.component.scss']
})
export class CurrencyLabelComponent {

  @Input()
  currency: string | null = null

  @Input()
  full: boolean = false

  isCrypto(): boolean {
    return this.currency != null && (this.currency == 'USDT' || this.currency == 'TRX')
  }

  formatCurrency(): string {
    switch (this.currency) {
      case 'RUB': return 'fi-ru'
      case 'USD': return 'fi-us'
      case 'EUR': return 'fi-eu'
      case 'KZT': return 'fi-kz'
      case 'TRY': return 'fi-tr'
      case 'RSD': return 'fi-rs'
      default: return ''
    }
  }

  formatCryptoCurrency(): string {
    switch (this.currency) {
      case 'USDT': return 'cf-usdt'
      case 'TRX': return 'cf-trx'
      default: return ''
    }
  }

}

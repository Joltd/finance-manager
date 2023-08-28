import {Component, forwardRef, OnInit, ViewChild} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {EntrySelectComponent} from "../entry-select/entry-select.component";
import {CurrencyService} from "../../../reference/service/currency.service";
import {Currency} from "../../../reference/model/currency";

@Component({
  selector: 'currency-select',
  templateUrl: 'currency-select.component.html',
  styleUrls: ['currency-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CurrencySelectComponent)
    }
  ]
})
export class CurrencySelectComponent implements OnInit, ControlValueAccessor {

  @ViewChild(EntrySelectComponent)
  currencySelect!: EntrySelectComponent

  currencies: Currency[] = []
  currency: string | null = null
  private disabled: boolean = false
  private onChange = (_: any) => {}

  constructor(public currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.currencyService.list()
      .subscribe(result => this.currencies = result)
  }

  registerOnChange(fn: any) {
    this.onChange = fn
  }

  registerOnTouched(fn: any) {}

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled
  }

  writeValue(obj: any) {
    this.currency = obj
  }

  showCurrencySelect() {
    if (this.disabled) {
      return
    }
    if (!this.currencySelect.visible()) {
      this.currencySelect.show()
    }
  }

  select(currency: string) {
    if (this.disabled) {
      return
    }
    this.currency = currency
    this.currencySelect.close()
    this.onChange(currency)
  }

  visible(): boolean {
    return this.currencySelect.visible()
  }

}

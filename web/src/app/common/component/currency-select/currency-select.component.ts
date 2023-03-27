import {Component, forwardRef, ViewChild} from "@angular/core";
import {SettingsService} from "../../../settings/service/settings.service";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {EntrySelectComponent} from "../entry-select/entry-select.component";

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
export class CurrencySelectComponent implements ControlValueAccessor {

  @ViewChild(EntrySelectComponent)
  currencySelect!: EntrySelectComponent

  currency: string | null = null
  private disabled: boolean = false
  private onChange = (_: any) => {}

  constructor(public settingsService: SettingsService) {}

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

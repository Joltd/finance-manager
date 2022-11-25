import {Component, ElementRef, Input, OnDestroy, Optional, Self, ViewChild} from "@angular/core";
import {ControlValueAccessor, FormControl, NgControl, Validators} from "@angular/forms";
import {MatFormFieldControl} from "@angular/material/form-field";
import {Subject} from "rxjs";
import {ReferenceService} from "../../service/reference.service";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {CurrencySelectComponent} from "../currency-select/currency-select.component";

@Component({
  selector: 'currency-input',
  templateUrl: 'currency-input.component.html',
  styleUrls: ['currency-input.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: CurrencyInputComponent
    }
  ],
  host: {
    '[id]': 'id',
  }
})
export class CurrencyInputComponent implements MatFormFieldControl<string>, ControlValueAccessor, OnDestroy {

  private static nextId = 0

  currency: FormControl = new FormControl(null)

  @ViewChild(CurrencySelectComponent)
  currencySelect!: CurrencySelectComponent

  stateChanges = new Subject<void>()
  private _placeholder!: string
  id = `currency-input-${CurrencyInputComponent.nextId++}`
  focused: boolean = false
  touched: boolean = false
  private _required: boolean = false
  _disabled: boolean = false
  controlType = 'currency-input'
  onChange = (_: any) => {}
  onTouched = () => {}

  constructor(
    @Optional()
    @Self()
    public ngControl: NgControl
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this
    }
    this.currency.valueChanges.subscribe(value => {
      this.onChange(this.value)
    })
  }

  ngOnDestroy(): void {
    this.stateChanges.complete()
  }

  @Input()
  get value(): string | null {
    return this.currency.value
  }
  set value(value: string | null) {
    this.currency.setValue(value)
    this.stateChanges.next()
  }

  @Input()
  get placeholder(): string {
    return this._placeholder
  }
  set placeholder(placeholder: string) {
    this._placeholder = placeholder
    this.stateChanges.next()
  }

  get empty() {
    return !this.currency.value
  }

  get shouldLabelFloat() {
    return !this.empty
  }

  @Input()
  get required() {
    return this._required || this.ngControl?.control?.hasValidator(Validators.required) || false
  }
  set required(required: any) {
    this._required = coerceBooleanProperty(required)
    this.stateChanges.next()
  }

  @Input()
  get disabled() {
    return this.ngControl?.disabled || this._disabled
  }
  set disabled(disabled: any) {
    this._disabled = coerceBooleanProperty(disabled)
    if (this._disabled) {
      this.currency.disable()
    } else {
      this.currency.enable()
    }
    this.stateChanges.next()
  }

  get errorState() {
    return this.touched && !this.currencySelect.visible() && (this.ngControl?.invalid || false)
  }

  setDescribedByIds(ids: string[]) {}

  onContainerClick(event: MouseEvent) {
    this.currencySelect.showCurrencySelect()
    this.touched = true
    this.onTouched()
  }

  registerOnChange(fn: any) {
    this.onChange = fn
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled
  }

  writeValue(value: string | null) {
    this.value = value
  }

}

import {Component, ElementRef, Input, OnDestroy, Optional, Self, ViewChild} from "@angular/core";
import {Amount, fromFractional, toFractional} from "../../model/amount";
import {ControlValueAccessor, FormBuilder, FormGroup, NgControl, Validators} from "@angular/forms";
import {MatFormFieldControl} from "@angular/material/form-field";
import {Subject} from "rxjs";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {SettingsService} from "../../../settings/service/settings.service";

@Component({
  selector: 'amount-input',
  templateUrl: 'amount-input.component.html',
  styleUrls: ['amount-input.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: AmountInputComponent
    }
  ],
  host: {
    '[id]': 'id',
  }
})
export class AmountInputComponent implements MatFormFieldControl<Amount>, ControlValueAccessor, OnDestroy {

  private static nextId = 0

  @ViewChild('value')
  valueInput!: HTMLInputElement
  @ViewChild('currency')
  currencySelect!: HTMLSelectElement

  amount: FormGroup = this.fb.group({
    value: ['', [Validators.required, Validators.min(0), Validators.pattern(/\d*\.?\d{1,4}/)]],
    currency: ['', Validators.required]
  })
  stateChanges = new Subject<void>()
  private _placeholder!: string
  id = `amount-input-${AmountInputComponent.nextId++}`
  focused: boolean = false
  // touched: boolean = false
  private _required: boolean = false
  _disabled: boolean = false
  controlType = 'amount-input'
  onChange = (_: any) => {}
  onTouched = () => {}

  constructor(
    public settingsService: SettingsService,
    private elementRef: ElementRef<HTMLElement>,
    private fb: FormBuilder,
    @Optional()
    @Self()
    public ngControl: NgControl
  ) {
    this.amount = fb.group({
      'value': null,
      'currency': null
    })
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this
    }
  }

  ngOnDestroy(): void {
    this.stateChanges.complete()
  }

  @Input()
  get value(): Amount | null {
    let value = this.amount.value.value
    let currency = this.amount.value.currency
    if (!value || !currency) {
      return null
    }
    let amount = new Amount()
    amount.value = fromFractional(value)
    amount.currency = currency
    return amount
  }
  set value(amount: Amount | null) {
    let value = amount ? toFractional(amount) : ''
    let currency = amount ? amount.currency : ''
    this.amount.setValue({
      value: value,
      currency: currency
    })
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

  onFocusIn(event: FocusEvent) {
    if (!this.focused) {
      this.focused = true
      this.stateChanges.next()
    }
  }

  onFocusOut(event: FocusEvent) {
    if (!this.elementRef.nativeElement.contains(event.relatedTarget as Element)) {
    //   this.touched = true;
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }

  get empty() {
    return !this.amount.value.value && !this.amount.value.currency
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty
  }

  @Input()
  get required() {
    return this._required
  }
  set required(required: any) {
    this._required = coerceBooleanProperty(required)
    this.stateChanges.next()
  }

  @Input()
  get disabled() {
    return this._disabled
  }
  set disabled(disabled: any) {
    this._disabled = coerceBooleanProperty(disabled)
    if (this._disabled) {
      this.amount.disable()
    } else {
      this.amount.enable()
    }
    this.stateChanges.next()
  }

  get errorState() {
    return this.amount.invalid
  }

  setDescribedByIds(ids: string[]) {}

  onContainerClick(event: MouseEvent) {
    // todo focus on value input
    // if ((event.target as Element).tagName.toLowerCase() != 'input') {
    //   this._elementRef.nativeElement.querySelector('input').focus();
    // }
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

  writeValue(amount: Amount | null) {
    this.value = amount
  }

  onInput() {
    this.onChange(this.value)
  }

}

import {MatFormFieldControl} from "@angular/material/form-field";
import {Account, AccountType} from "../../model/account";
import {ControlValueAccessor, NgControl, Validators} from "@angular/forms";
import {Component, Input, OnDestroy, Optional, Self, ViewChild} from "@angular/core";
import {Subject} from "rxjs";
import {AccountService} from "../../service/account.service";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {CdkPortal} from "@angular/cdk/portal";
import {Overlay, OverlayConfig, OverlayRef} from "@angular/cdk/overlay";

@Component({
  selector: 'account-input',
  templateUrl: 'account-input.component.html',
  styleUrls: ['account-input.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: AccountInputComponent
    }
  ],
  host: {
    '[id]': 'id',
  }
})
export class AccountInputComponent implements MatFormFieldControl<Account>, ControlValueAccessor, OnDestroy {

  private static nextId = 0

  @ViewChild(CdkPortal)
  portal!: CdkPortal
  ref!: OverlayRef

  @Input()
  types: AccountType[] = ['ACCOUNT', 'EXPENSE', 'INCOME']

  accounts: Account[] = []
  expenses: Account[] = []
  incomes: Account[] = []

  private _value: Account | null = null
  name: string = '-'

  stateChanges = new Subject<void>()
  private _placeholder!: string
  id = `account-input-${AccountInputComponent.nextId++}`
  focused: boolean = false
  touched: boolean = false
  private _required: boolean = false
  _disabled: boolean = false
  controlType = 'account-input'
  onChange = (_: any) => {}
  onTouched = () => {}

  constructor(
    private accountService: AccountService,
    @Optional()
    @Self()
    public ngControl: NgControl,
    private overlay: Overlay
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this
    }
    this.accountService.list()
      .subscribe(result => {
        this.accounts = result.filter(account => account.type == 'ACCOUNT')
        this.expenses = result.filter(account => account.type == 'EXPENSE')
        this.incomes = result.filter(account => account.type == 'INCOME')
      })
  }

  ngOnDestroy(): void {
    this.stateChanges.complete()
  }

  @Input()
  get value(): Account | null {
    return this._value
  }
  set value(value: Account | null) {
    this._value = value
    if (!value) {
      this.name = '-'
      this.stateChanges.next()
      return
    }

    this.stateChanges.next()
    this.setupName()
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
    return this._value == null
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty
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
    return this._disabled
  }
  set disabled(disabled: any) {
    this._disabled = coerceBooleanProperty(disabled)
    this.stateChanges.next()
  }

  get errorState() {
    return this.touched && !this.isAccountSelectionVisible() && (this.ngControl?.invalid || false)
  }

  setDescribedByIds(ids: string[]) {}

  onContainerClick(event: MouseEvent) {
    if (!this._disabled) {
      this.showAccountSelection()
      this.touched = true
      this.onTouched()
    }
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

  writeValue(value: Account | null) {
    this.value = value
  }

  selectAccount(value: Account | null) {
    this.value = value
    this.closeAccountSelection()
    this.onChange(value)
  }

  private setupName() {
    if (this.value != null) {
      this.name = this.value.name
    } else {
      this.name = `Nothing`
    }
  }

  private showAccountSelection() {
    let config = new OverlayConfig({
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
    })
    this.ref = this.overlay.create(config)
    this.ref.attach(this.portal)
    this.ref.backdropClick().subscribe(() => this.closeAccountSelection())
  }

  private closeAccountSelection() {
    if (this.ref != undefined) {
      this.ref.detach()
    }
  }

  private isAccountSelectionVisible(): boolean {
    return this.ref?.hasAttached()
  }

  isNoData(): boolean {
    return this.types.length == 0 || (this.accounts.length == 0 && this.expenses.length == 0 && this.incomes.length == 0)
  }

  isAccountTypeEnabled(): boolean {
    return this.types.indexOf('ACCOUNT') > -1 && this.accounts.length > 0
  }

  isExpenseTypeEnabled(): boolean {
    return this.types.indexOf('EXPENSE') > -1 && this.expenses.length > 0
  }

  isIncomeTypeEnabled(): boolean {
    return this.types.indexOf('INCOME') > -1 && this.incomes.length > 0
  }

}

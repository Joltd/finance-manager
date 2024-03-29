import {Component, Input, OnDestroy, Optional, Self, ViewChild,} from "@angular/core";
import {MatFormFieldControl} from "@angular/material/form-field";
import {ControlValueAccessor, NgControl, Validators} from "@angular/forms";
import {Subject} from "rxjs";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {Endpoint, Reference} from "../../model/reference";
import {ReferenceService} from "../../service/reference.service";
import {EntrySelectComponent} from "../entry-select/entry-select.component";

@Component({
  selector: 'reference-input',
  templateUrl: 'reference-input.component.html',
  styleUrls: ['reference-input.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: ReferenceInputComponent
    }
  ],
  host: {
    '[id]': 'id',
  }
})
export class ReferenceInputComponent implements MatFormFieldControl<Reference>, ControlValueAccessor, OnDestroy {

  private static nextId: number = 0

  @ViewChild(EntrySelectComponent)
  entrySelect!: EntrySelectComponent

  @Input()
  references: Reference[] = []
  private _value: Reference | null = null
  name: string = '-'

  stateChanges = new Subject<void>()
  private _placeholder!: string
  id: string = `reference-input-${ReferenceInputComponent.nextId++}`
  focused: boolean = false
  touched: boolean = false
  private _required: boolean = false
  _disabled: boolean = false
  controlType = 'reference-input'
  onChange = (_: any) => {}
  onTouched = () => {}

  constructor(
    private referenceService: ReferenceService,
    @Optional()
    @Self()
    public ngControl: NgControl
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this
    }
  }

  ngOnDestroy(): void {
    this.stateChanges.complete()
  }

  @Input()
  set api(api: string | Endpoint) {
    let endpoint = typeof api == 'string'
      ? {url: api} as Endpoint
      : api as Endpoint
    this.referenceService.list(endpoint)
      .subscribe(result => {
        this.references = result
        this.setupName()
      })
  }

  @Input()
  get value(): Reference | null {
    return this._value
  }
  set value(value: Reference | null) {
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
    return this.touched && !this.entrySelect.visible() && (this.ngControl?.invalid || false)
  }

  setDescribedByIds(ids: string[]) {}

  onContainerClick(event: MouseEvent) {
    if (!this._disabled) {
      this.entrySelect.show()
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

  writeValue(value: Reference | null) {
    this.value = value
  }

  selectEntry(value: Reference | null) {
    this.value = value
    this.entrySelect.close()
    this.onChange(this.value)
  }

  private setupName() {
    if (this.value != null) {
      this.name = this.value.name
    } else {
      this.name = `Nothing`
    }
  }
}


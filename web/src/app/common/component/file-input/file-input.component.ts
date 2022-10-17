import {Component, ElementRef, Input, OnDestroy, Optional, Self, ViewChild} from "@angular/core";
import {Subject} from "rxjs";
import {ControlValueAccessor, NgControl} from "@angular/forms";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {MatFormFieldControl} from "@angular/material/form-field";

@Component({
  selector: 'file-input',
  templateUrl: 'file-input.component.html',
  styleUrls: ['file-input.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: FileInputComponent
    }
  ],
  host: {
    '[id]': 'id',
  }
})
export class FileInputComponent implements MatFormFieldControl<File>, ControlValueAccessor, OnDestroy {

  private static nextId = 0

  @ViewChild('fileInput')
  fileInput!: ElementRef
  private _value: File | null = null
  name: string = '-'
  stateChanges = new Subject<void>()
  private _placeholder!: string
  id = `file-input-${FileInputComponent.nextId++}`
  focused: boolean = false
  // touched: boolean = false
  private _required: boolean = false
  _disabled: boolean = false
  controlType = 'file-input'
  onChange = (_: any) => {}
  onTouched = () => {}

  constructor(
    private elementRef: ElementRef<HTMLElement>,
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
  get value(): File | null {
    return this._value
  }
  set value(value: File | null) {
    this._value = value
    if (!value) {
      this.name = '-'
    } else {
      this.name = value.name
    }
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
    return this._value == null
  }

  get shouldLabelFloat() {
    // console.log(`${this.focused || !this.empty}`)
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
    this.stateChanges.next()
  }

  get errorState() {
    return false
  }

  setDescribedByIds(ids: string[]) {}

  onContainerClick(event: MouseEvent) {
    if (!this._disabled) {
      this.fileInput.nativeElement.click()
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

  writeValue(value: File | null) {
    this.value = value
  }

  fileSelect(event: any) {
    let file = event.target.files[0]
    if (file) {
      this.value = file
    } else {
      this.value = null
    }
    this.onChange(this.value)
  }

}

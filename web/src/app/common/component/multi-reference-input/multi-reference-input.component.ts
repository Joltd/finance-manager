import { MatFormFieldControl } from "@angular/material/form-field";
import { Endpoint, Reference } from "../../model/reference";
import { ControlValueAccessor, NgControl, Validators } from "@angular/forms";
import { Component, Input, OnDestroy, Optional, Self, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { ReferenceService } from "../../service/reference.service";
import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { CdkPortal } from "@angular/cdk/portal";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { MatSelectionList } from "@angular/material/list";
import { AdaptiveService } from "../../service/adaptive.service";

@Component({
  selector: 'multi-reference-input',
  templateUrl: 'multi-reference-input.component.html',
  styleUrls: ['multi-reference-input.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: MultiReferenceInputComponent
    }
  ],
  host: {
    '[id]': 'id'
  }
})
export class MultiReferenceInputComponent implements MatFormFieldControl<Reference[]>, ControlValueAccessor, OnDestroy {

  private static nextId: number = 0

  @ViewChild(CdkPortal)
  portal!: CdkPortal
  ref: OverlayRef | null = null

  @ViewChild(MatSelectionList)
  selection!: MatSelectionList

  @Input()
  references: Reference[] = []
  private _value: Reference[] = []

  stateChanges = new Subject<void>()
  private _placeholder!: string
  id: string = `multi-reference-input-${MultiReferenceInputComponent.nextId++}`
  focused: boolean = false
  touched: boolean = false
  private _required: boolean = false
  _disabled: boolean = false
  controlType = 'multi-reference-input'
  onChange = (_: any) => {}
  onTouched = () => {}

  constructor(
    public adaptiveService: AdaptiveService,
    private overlay: Overlay,
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
      .subscribe(result => this.references = result)
  }

  @Input()
  get value(): Reference[] {
    return this._value
  }
  set value(value: Reference[] | null) {
    this._value = value ?? []
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
    return !this._value?.length
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
    return this.touched && !this.ref?.hasAttached() && (this.ngControl?.invalid || false)
  }

  setDescribedByIds(ids: string[]) {}

  onContainerClick(event: MouseEvent) {
    if (this._disabled) {
      return
    }

    this.showSelection()

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

  writeValue(value: Reference[]) {
    this.value = value
  }

  isSelected(reference: Reference): boolean {
    return this.value.findIndex(it => it.id == reference.id) >= 0
  }

  private showSelection() {
    this.ref = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
    })
    this.ref.attach(this.portal)
    this.ref.backdropClick().subscribe(() => this.ref?.detach())
  }

  applySelection() {
    this.value = this.selection
      .selectedOptions
      .selected
      .map(it => it.value)
    this.onChange(this.value)
    this.ref?.detach()
  }

  onSearch(event: Event) {
    let query = (event.target as HTMLInputElement).value
  }
}

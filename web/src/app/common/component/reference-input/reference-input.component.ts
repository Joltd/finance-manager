import {Component, ElementRef, Input, OnDestroy, Optional, Self} from "@angular/core";
import {MatFormFieldControl} from "@angular/material/form-field";
import {ControlValueAccessor, FormControl, NgControl} from "@angular/forms";
import {debounceTime, Observable, startWith, Subject, switchMap} from "rxjs";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {Reference} from "../../model/reference";
import {HttpClient} from "@angular/common/http";
import {TypeUtils} from "../../service/type-utils";
import {MatDialog} from "@angular/material/dialog";
import {ReferenceSelectComponent} from "../reference-select/reference-select.component";

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
export class ReferenceInputComponent implements MatFormFieldControl<string>, ControlValueAccessor, OnDestroy {

  private static nextId = 0

  @Input()
  api!: string

  private _value: string | null = null
  name: string = '-'

  stateChanges = new Subject<void>()
  private _placeholder!: string
  id = `reference-input-${ReferenceInputComponent.nextId++}`
  focused: boolean = false
  // touched: boolean = false
  private _required: boolean = false
  _disabled: boolean = false
  controlType = 'reference-input'
  onChange = (_: any) => {}
  onTouched = () => {}

  constructor(
    private http: HttpClient,
    private elementRef: ElementRef<HTMLElement>,
    @Optional()
    @Self()
    public ngControl: NgControl,
    private dialog: MatDialog
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this
    }
  }

  ngOnDestroy(): void {
    this.stateChanges.complete()
  }

  @Input()
  get value(): string | null {
    return this._value
  }
  set value(value: string | null) {
    this._value = value
    if (!value) {
      this.name = '-'
      this.stateChanges.next()
      return
    }

    this.byId(value)
      .subscribe(result => {
        if (result.length == 0) {
          this.name = `Unknown (${value})`
        } else {
          this.name = result[0].name
        }
        this.stateChanges.next()
      })
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
    // console.log(`empty() "${this._value}"`)
    return this._value == null
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
    // if (this._disabled) { todo
    //   this.name.disable()
    // } else {
    //   this.name.enable()
    // }
    this.stateChanges.next()
  }

  get errorState() {
    return false
  }

  setDescribedByIds(ids: string[]) {}

  onContainerClick(event: MouseEvent) {
    this.select()
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

  select() {
    this.dialog.open(ReferenceSelectComponent, {data: this.api})
      .afterClosed()
      .subscribe(result => {
        if (!result) {
          return
        }

        if (result == ReferenceSelectComponent.NULL_RESULT) {
          this.value = null
        } else {
          this.value = result
        }

        this.onChange(this.value)
      })
  }

  private byId(id: string): Observable<Reference[]> {
    return this.http.get<Reference[]>(this.api + '?id=' + id, TypeUtils.of(Reference))
  }

}


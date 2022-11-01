import {Component, EventEmitter, Input, Output} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Document} from "../../model/document";
import {DocumentTyped} from "../../model/document-typed";

@Component({
  selector: 'document-exchange',
  templateUrl: 'document-exchange.component.html',
  styleUrls: ['document-exchange.component.scss']
})
export class DocumentExchangeComponent {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    date: new FormControl(null, Validators.required),
    accountFrom: new FormControl(null, Validators.required),
    amountFrom: new FormControl(null, Validators.required),
    accountTo: new FormControl(null, Validators.required),
    amountTo: new FormControl(null, Validators.required)
  })

  @Input()
  set document(document: Document) {
    this.form.patchValue(document)
  }

  @Input()
  hint: string | null = null

  @Output()
  onSave: EventEmitter<DocumentTyped> = new EventEmitter<DocumentTyped>()

  @Output()
  onClose: EventEmitter<void> = new EventEmitter<void>()

  save() {
    if (!this.form.valid) {
      return
    }

    let document = new DocumentTyped()
    document.type = 'exchange'
    document.value = this.form.value
    this.onSave.next(document)
  }

  close() {
    this.onClose.next()
  }

}

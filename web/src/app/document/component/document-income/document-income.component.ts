import {Component, EventEmitter, Input, Output} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Document} from "../../model/document";
import {DocumentTyped} from "../../model/document-typed";

@Component({
  selector: 'document-income',
  templateUrl: 'document-income.component.html',
  styleUrls: ['document-income.component.scss']
})
export class DocumentIncomeComponent {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    date: new FormControl(null, Validators.required),
    account: new FormControl(null, Validators.required),
    incomeCategory: new FormControl(null, Validators.required),
    amount: new FormControl(null, Validators.required),
    description: new FormControl('')
  })

  @Input()
  set document(document: Document) {
    this.form.patchValue(document)
  }

  @Output()
  onSave: EventEmitter<DocumentTyped> = new EventEmitter<DocumentTyped>()

  @Output()
  onClose: EventEmitter<void> = new EventEmitter<void>()

  save() {
    if (!this.form.valid) {
      return
    }

    let document = new DocumentTyped()
    document.type = 'income'
    document.value = this.form.value
    this.onSave.next(document)
  }

  close() {
    this.onClose.next()
  }

}

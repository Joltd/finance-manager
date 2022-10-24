import {Component, EventEmitter, Input, Output} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Document} from "../../model/document";
import {DocumentTyped} from "../../model/document-typed";

@Component({
  selector: 'document-expense',
  templateUrl: 'document-expense.component.html',
  styleUrls: ['document-expense.component.scss']
})
export class DocumentExpenseComponent {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    date: new FormControl(null, Validators.required),
    account: new FormControl(null, Validators.required),
    expenseCategory: new FormControl(null, Validators.required),
    amount: new FormControl(null, Validators.required),
    description: new FormControl('')
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
    document.type = 'expense'
    document.value = this.form.value
    this.onSave.emit(document)
  }

  close() {
    this.onClose.emit()
  }

}

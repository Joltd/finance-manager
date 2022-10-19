import {Component, EventEmitter} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {DocumentExpenseService} from "../../service/document-expense.service";

@Component({
  selector: 'document-expense',
  templateUrl: 'document-expense.component.html',
  styleUrls: ['document-expense.component.scss']
})
export class DocumentExpenseComponent {

  document: FormGroup = new FormGroup({
    id: new FormControl(null),
    date: new FormControl(null, Validators.required),
    account: new FormControl(null, Validators.required),
    expenseCategory: new FormControl(null, Validators.required),
    amount: new FormControl(null, Validators.required),
    description: new FormControl('')
  })
  save: () => Observable<void> = () => this.doSave()

  constructor(
    private activatedRoute: ActivatedRoute,
    private documentExpenseService: DocumentExpenseService
  ) {
    this.activatedRoute.params
      .subscribe(params => {
        let id = params['id']
        if (id != 'new') {
          this.document.patchValue({id})
          this.load()
        }
      })
  }

  private load() {
    let id = this.document.value.id;
    if (id == null) {
      return
    }
    this.documentExpenseService.byId(id)
      .subscribe(result => this.document.setValue(result))
  }

  private doSave(): Observable<void> {
    let eventEmitter = new EventEmitter<void>()
    this.documentExpenseService.update(this.document.value)
      .subscribe(() => eventEmitter.emit())
    return eventEmitter
  }

}

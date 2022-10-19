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

  private id!: string
  document: FormGroup = new FormGroup({
    date: new FormControl(null, Validators.required),
    account: new FormControl(null, Validators.required),
    expenseCategory: new FormControl(null, Validators.required),
    amount: new FormControl(null, Validators.required)
  })
  save: () => Observable<void> = () => this.doSave()

  constructor(
    private activatedRoute: ActivatedRoute,
    private documentExpenseService: DocumentExpenseService
  ) {
    this.activatedRoute.params
      .subscribe(params => {
        this.id = params['id']
        this.load()
      })
  }

  private load() {
    this.documentExpenseService.byId(this.id)
      .subscribe(result => this.document.setValue(result))
  }

  private doSave(): Observable<void> {
    let eventEmitter = new EventEmitter<void>()
    this.documentExpenseService.update(this.document.value)
      .subscribe(() => eventEmitter.emit())
    return eventEmitter
  }

}

import {Component, EventEmitter} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {DocumentIncomeService} from "../../service/document-income.service";

@Component({
  selector: 'document-income',
  templateUrl: 'document-income.component.html',
  styleUrls: ['document-income.component.scss']
})
export class DocumentIncomeComponent {

  document: FormGroup = new FormGroup({
    id: new FormControl(null),
    date: new FormControl(null, Validators.required),
    account: new FormControl(null, Validators.required),
    incomeCategory: new FormControl(null, Validators.required),
    amount: new FormControl(null, Validators.required),
    description: new FormControl('')
  })
  save: () => Observable<void> = () => this.doSave()

  constructor(
    private activatedRoute: ActivatedRoute,
    private documentIncomeService: DocumentIncomeService
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
    this.documentIncomeService.byId(id)
      .subscribe(result => this.document.setValue(result))
  }

  private doSave(): Observable<void> {
    let eventEmitter = new EventEmitter<void>()
    this.documentIncomeService.update(this.document.value)
      .subscribe(() => eventEmitter.emit())
    return eventEmitter
  }

}

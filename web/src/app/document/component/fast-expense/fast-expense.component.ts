import {Component} from "@angular/core";
import {DocumentService} from "../../service/document.service";
import {SettingsService} from "../../../settings/service/settings.service";
import {DocumentTyped} from "../../model/document-typed";
import {Router} from "@angular/router";
import * as moment from "moment";

@Component({
  selector: 'fast-expense',
  templateUrl: 'fast-expense.component.html',
  styleUrls: ['fast-expense.component.scss']
})
export class FastExpenseComponent {

  document: any

  constructor(
    private documentService: DocumentService,
    private settingsService: SettingsService,
    private router: Router
  ) {
    let fastExpense = this.settingsService.settings.fastExpense
    this.document = {
      date: moment().format("yyyy-MM-DD"),
      amount: {
        currency: fastExpense?.currency
      },
      account: fastExpense?.account
    }
  }

  save(document: DocumentTyped) {
    this.documentService.update(document)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['dashboard']).then()
  }

}

import {Component} from "@angular/core";
import {DocumentService} from "../../service/document.service";
import {SettingsService} from "../../../settings/service/settings.service";
import {Router} from "@angular/router";
import * as moment from "moment/moment";
import {DocumentTyped} from "../../model/document-typed";

@Component({
  selector: 'fast-exchange',
  templateUrl: './fast-exchange.component.html',
  styleUrls: ['./fast-exchange.component.scss']
})
export class FastExchangeComponent {

  document: any

  constructor(
    private documentService: DocumentService,
    private settingsService: SettingsService,
    private router: Router
  ) {
    let fastExpense = this.settingsService.settings.fastExpense
    this.document = {
      date: moment().format("yyyy-MM-DD"),
      amountFrom: {
        currency: fastExpense?.currency
      },
      amountTo: {
        currency: fastExpense?.currency
      }
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

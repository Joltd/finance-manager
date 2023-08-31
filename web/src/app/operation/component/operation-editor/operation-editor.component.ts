import {Component, OnInit} from "@angular/core";
import {Operation} from "../../model/operation";
import {OperationService} from "../../service/operation.service";
import {ActivatedRoute, Router} from "@angular/router";
import {combineLatest} from "rxjs";
import {SettingsService} from "../../../settings/service/settings.service";
import * as moment from "moment";
import {Amount} from "../../../common/model/amount";
import {Reference} from "../../../common/model/reference";

@Component({
  selector: 'operation-editor',
  templateUrl: './operation-editor.component.html',
  styleUrls: ['./operation-editor.component.scss']
})
export class OperationEditorComponent implements OnInit {

  type: 'EXCHANGE' | 'EXPENSE' | 'INCOME' = 'EXCHANGE'
  operation: Operation | null = null

  constructor(
    private settingsService: SettingsService,
    private operationService: OperationService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams])
      .subscribe(([params, queryParams]) => {
        let id = params['id']
        if (id != 'new') {
          this.viewById(id)
          return
        }

        let copyId = queryParams['copy']
        if (copyId != null) {
          this.newByCopy(copyId)
          return
        }

        let template = queryParams['template']
        if (template != null) {
          this.newByTemplate(template)
          return
        }
      })
  }

  save(operation: Operation) {
    this.operationService.update(operation)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['operation']).then()
  }

  private viewById(id: string) {
    this.operationService.byId(id)
      .subscribe(result => this.operation = result)
  }

  private newByCopy(copyId: string) {
    this.operationService.byId(copyId)
      .subscribe(result => {
        result.id = null
        this.operation = result
      })
  }

  private newByTemplate(template: 'EXPENSE_CASH' | 'EXCHANGE_TO_CASH' | 'EXCHANGE_FROM_CASH') {
    let amount = null
    let currency = this.settingsService.settings?.operationDefaultCurrency
    if (currency != null) {
      amount = {
        currency: currency,
        value: 0
      }
    }

    let cashAccount = this.settingsService.settings?.operationCashAccount
    let defaultAccount = this.settingsService.settings?.operationDefaultAccount

    if (template === 'EXPENSE_CASH') {
      this.type = 'EXPENSE'
      this.operationTemplate(amount, defaultAccount, null)
    } else if (template === 'EXCHANGE_TO_CASH') {
      this.type = 'EXCHANGE'
      this.operationTemplate(amount, defaultAccount, cashAccount)
    } else if (template === 'EXCHANGE_FROM_CASH') {
      this.type = 'EXCHANGE'
      this.operationTemplate(amount, cashAccount, defaultAccount)
    }
  }

  private operationTemplate(
    amount: Amount | null,
    accountFrom: Reference | null,
    accountTo: Reference | null,
  ): any {
    this.operation = {
      id: null,
      date: moment().format("yyyy-MM-DD"),
      accountFrom: accountFrom,
      amountFrom: amount,
      accountTo: accountTo,
      amountTo: amount,
      description: '',
    } as any
  }

}

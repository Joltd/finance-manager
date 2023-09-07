import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Operation, OperationType} from "../../model/operation";
import {OperationService} from "../../service/operation.service";
import {ActivatedRoute, Router} from "@angular/router";
import {combineLatest} from "rxjs";
import {SettingsService} from "../../../settings/service/settings.service";
import * as moment from "moment";
import {Amount} from "../../../common/model/amount";
import {Reference} from "../../../common/model/reference";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {OperationViewComponent} from "../operation-view/operation-view.component";

@Component({
  selector: 'operation-editor',
  templateUrl: './operation-editor.component.html',
  styleUrls: ['./operation-editor.component.scss']
})
export class OperationEditorComponent implements OnInit, OnDestroy {

  operation!: Operation

  @ViewChild(OperationViewComponent)
  operationView!: OperationViewComponent

  constructor(
    private settingsService: SettingsService,
    private operationService: OperationService,
    private activatedRoute: ActivatedRoute,
    private toolbarService: ToolbarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.toolbarService.setupSaveClose('Operation', () => this.save(), () => this.close())
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

  ngOnDestroy(): void {
    this.toolbarService.reset()
  }

  save() {
    if (!this.operationView.valid) {
      return
    }
    this.operationService.update(this.operationView.operation)
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
      this.operationTemplate('EXPENSE', amount, defaultAccount, null)
    } else if (template === 'EXCHANGE_TO_CASH') {
      this.operationTemplate('TRANSFER', amount, defaultAccount, cashAccount)
    } else if (template === 'EXCHANGE_FROM_CASH') {
      this.operationTemplate('TRANSFER', amount, cashAccount, defaultAccount)
    }
  }

  private operationTemplate(
    type: OperationType,
    amount: Amount | null,
    accountFrom: Reference | null,
    accountTo: Reference | null,
  ): any {
    this.operation = {
      id: null,
      date: moment().format("yyyy-MM-DD"),
      type: type,
      accountFrom: accountFrom,
      amountFrom: amount,
      accountTo: accountTo,
      amountTo: amount,
      description: '',
    } as any
  }

}

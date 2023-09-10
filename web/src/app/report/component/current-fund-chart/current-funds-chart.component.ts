import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {CurrentFundsChartService} from "../../service/current-funds-chart.service";
import {CurrentFundsChart, CurrentFundsChartEntry, CurrentFundsChartEntryAmount} from "../../model/current-funds-chart";
import {MatExpansionPanel} from "@angular/material/expansion";
import {FormControl, FormGroup} from "@angular/forms";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {Amount} from "../../../common/model/amount";
import {OperationService} from "../../../operation/service/operation.service";

@Component({
  selector: 'current-funds-chart',
  templateUrl: './current-funds-chart.component.html',
  styleUrls: ['./current-funds-chart.component.scss']
})
export class CurrentFundsChartComponent implements OnInit,AfterViewInit {

  @ViewChild(MatExpansionPanel)
  filter!: MatExpansionPanel

  settings: FormGroup = new FormGroup({
    currency: new FormControl('USD')
  })
  currentFund!: CurrentFundsChart
  maxCommonAmount: number = 0

  constructor(
    private currentFundsChartService: CurrentFundsChartService,
    private toolbarService: ToolbarService,
    private operationService: OperationService
  ) {}

  ngOnInit(): void {
    this.toolbarService.setup('Current Funds Chart', [
      { name: 'apply', icon: 'done', action: () => this.apply() }
    ])
  }

  ngAfterViewInit(): void {
    this.apply()
  }

  apply() {
    this.filter.close()
    this.currentFundsChartService.load(this.settings.value)
      .subscribe(result => {
        this.currentFund = result
        this.maxCommonAmount = Math.max(...this.currentFund.entries
          .flatMap(entry => entry.amounts)
          .map(entryAmount => entryAmount.commonAmount.value))
      })
  }

  amountRelativeWidth(commonAmount: Amount): number {
    return commonAmount.value / this.maxCommonAmount * 100
  }

  drillDown(entry: CurrentFundsChartEntry, amountEntry: CurrentFundsChartEntryAmount) {
    this.operationService.viewOperations({
      account: entry.account,
      currency: amountEntry.amount.currency
    })
  }

}
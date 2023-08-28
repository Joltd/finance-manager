import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatExpansionPanel} from "@angular/material/expansion";
import {ECharts} from "echarts";
import {FormControl, FormGroup} from "@angular/forms";
import {CumulativeFundsChart} from "../../model/cumulative-funds-chart";
import {CumulativeFundsChartService} from "../../service/cumulative-funds-chart.service";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {Router} from "@angular/router";
import * as echarts from "echarts";
import {OperationService} from "../../../operation/service/operation.service";

@Component({
  selector: 'cumulative-funds-chart',
  templateUrl: './cumulative-funds-chart.component.html',
  styleUrls: ['./cumulative-funds-chart.component.scss']
})
export class CumulativeFundsChartComponent implements OnInit,AfterViewInit,OnDestroy {

  @ViewChild('filter')
  filter!: MatExpansionPanel

  @ViewChild('chart')
  chartContainer!: ElementRef
  chart!: ECharts

  settings: FormGroup = new FormGroup({
    currency: new FormControl('USD')
  })
  chartData!: CumulativeFundsChart

  constructor(
    private cumulativeFundsChartService: CumulativeFundsChartService,
    private operationService: OperationService,
    private toolbarService: ToolbarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.toolbarService.setup('Cumulative Funds Chart', [
      { name: 'apply', icon: 'done', action: () => this.apply() }
    ])
  }

  ngAfterViewInit(): void {
    let chart = echarts.init(this.chartContainer.nativeElement)
    window.onresize = function () {
      chart.resize()
    }
    chart.on('click', params => this.forward(params))
    this.chart = chart

  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
    this.chart.dispose()
  }

  forward(params: any) {
    // this.operationService.filter.setValue({
    //   account: ,
    //   currency:
    // })
    // this.operationService.operationPage.page = 0
    // this.router.navigate(['operation']).then()
  }

  apply() {
    this.filter.close()
    this.cumulativeFundsChartService.load(this.settings.value)
      .subscribe(result => this.refreshChart(result))
  }

  private refreshChart(chartData: CumulativeFundsChart) {
    this.chartData = chartData

    let option = {
      xAxis: {
        type: 'category',
        data: chartData.dates
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'line',
          data: chartData.values
        }
      ]
    }
    setTimeout(() => {
      this.chart.resize()
      this.chart.clear()
      this.chart.setOption(option)
    }, 10)
  }

}

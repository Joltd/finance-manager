import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatExpansionPanel} from "@angular/material/expansion";
import * as echarts from "echarts";
import {ECharts} from "echarts";
import {FormControl, FormGroup} from "@angular/forms";
import {CumulativeFundsChart} from "../../model/cumulative-funds-chart";
import {CumulativeFundsChartService} from "../../service/cumulative-funds-chart.service";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {Router} from "@angular/router";
import {OperationService} from "../../../operation/service/operation.service";
import * as moment from "moment";

@Component({
  selector: 'cumulative-funds-chart',
  templateUrl: './cumulative-funds-chart.component.html',
  styleUrls: ['./cumulative-funds-chart.component.scss']
})
export class CumulativeFundsChartComponent implements OnInit,AfterViewInit,OnDestroy {

  @ViewChild(MatExpansionPanel)
  filter!: MatExpansionPanel

  @ViewChild('chart')
  chartContainer!: ElementRef
  chart!: ECharts

  settings: FormGroup = new FormGroup({
    dateFrom: new FormControl(moment().subtract(6, 'month').format('yyyy-MM-DD')),
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
    this.apply()
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
    this.chart.dispose()
  }

  forward(params: any) {
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
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          formatter: (value: string) => moment(value).format('MMM YYYY')
        },
        data: chartData.dates
      },
      yAxis: {
        type: 'value',
        show: false,
        min: (value: any) => value.min - (value.max - value.min) * 0.2,
        max: (value: any) => value.max + (value.max - value.min) * 0.2,
      },
      grid: {
        left: '5%',
        right: '5%',
        top: '5%',
        bottom: '10%',
      },
      series: [
        {
          type: 'line',
          label: {
            show: true,
          },
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

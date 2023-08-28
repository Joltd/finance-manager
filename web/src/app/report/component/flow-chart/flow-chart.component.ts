import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FlowChartService} from "../../service/flow-chart.service";
import {FormControl, FormGroup} from "@angular/forms";
import * as echarts from "echarts";
import {ECharts} from "echarts";
import {ReferenceService} from "../../../common/service/reference.service";
import {Reference} from "../../../common/model/reference";
import * as moment from "moment";
import {FlowChart} from "../../model/flow-chart";
import {MatExpansionPanel} from "@angular/material/expansion";
import {Router} from "@angular/router";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {OperationService} from "../../../operation/service/operation.service";

@Component({
  selector: 'flow-chart',
  templateUrl: 'flow-chart.component.html',
  styleUrls: ['flow-chart.component.scss']
})
export class FlowChartComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('filter')
  filter!: MatExpansionPanel

  @ViewChild('chart')
  chartContainer!: ElementRef
  chart!: ECharts
  chartHeight: number = 0

  expenseCategories: Reference[] = []
  incomeCategories: Reference[] = []

  settings: FormGroup = new FormGroup({
    dateFrom: new FormControl(moment().subtract(3, 'month').format('yyyy-MM-DD')),
    dateTo: new FormControl(moment().format('yyyy-MM-DD')),
    categories: new FormControl([]),
    currency: new FormControl('USD'),
    total: new FormControl(true),
    showAverage: new FormControl(false),
  })
  flow!: FlowChart

  constructor(
    private flowChartService: FlowChartService,
    private referenceService: ReferenceService,
    private operationService: OperationService,
    private toolbarService: ToolbarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.toolbarService.setup('Flow Chart', [
      { name: 'apply', icon: 'done', action: () => this.apply() }
    ])
    this.referenceService.list('/expense/reference')
      .subscribe(result => this.expenseCategories = result)
    this.referenceService.list('/income/reference')
      .subscribe(result => this.incomeCategories = result)
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
    if (this.settings.value.total) {
      this.settings.patchValue({
        total: false
      })
      // maybe add type setting
      return
    }

    this.operationService.filter.setValue({
      dateFrom: moment(params.name).format('yyyy-MM-DD'),
      dateTo: moment(params.name).add(1, 'month').format('yyyy-MM-DD'),
      category: params.seriesName
    })
    this.operationService.operationPage.page = 0
    this.router.navigate(['operation']).then()
  }

  apply() {
    this.filter.close()
    this.flowChartService.load(this.settings.value)
      .subscribe(result => this.refreshChart(result))
  }

  private refreshChart(flow: FlowChart) {
    this.flow = flow
    this.chartHeight = flow.dates.length * flow.series.length * 4

    let option = {
      xAxis: {
        type: 'value',
        show: false
      },
      yAxis: {
        type: 'category',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        data: flow.dates
      },
      series: flow.series.map(series => {
        return {
          type: 'bar',
          name: series.name,
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            borderRadius: 5,
          },
          barGap: '10%',
          barCategoryGap: '10%',
          data: series.values
        }
      })
    }
    setTimeout(() => {
      this.chart.resize()
      this.chart.clear()
      this.chart.setOption(option)
    }, 10)
  }

  clearCategories() {
    this.settings.patchValue({
      categories: []
    })
  }

}

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

  @ViewChild(MatExpansionPanel)
  filter!: MatExpansionPanel

  @ViewChild('chart')
  chartContainer!: ElementRef
  chart!: ECharts
  chartHeight: number = 0

  expenseCategories: Reference[] = []
  incomeCategories: Reference[] = []

  flow!: FlowChart

  constructor(
    public flowChartService: FlowChartService,
    private referenceService: ReferenceService,
    private operationService: OperationService,
    private toolbarService: ToolbarService
  ) {}

  ngOnInit(): void {
    this.toolbarService.setup('Flow Chart', [
      { name: 'apply', icon: 'done', action: () => this.apply() }
    ])
    this.referenceService.list({url: '/account/reference', queryParams: {type: 'EXPENSE'}})
      .subscribe(result => this.expenseCategories = result)
    this.referenceService.list({url: '/account/reference', queryParams: {type: 'INCOME'}})
      .subscribe(result => this.incomeCategories = result)
  }

  ngAfterViewInit(): void {
    let chart = echarts.init(this.chartContainer.nativeElement)
    window.onresize = function () {
      chart.resize()
    }
    chart.on('click', params => this.drillDown(params))
    this.chart = chart
    this.apply()
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
    this.chart.dispose()
  }

  drillDown(params: any) {
    if (this.flowChartService.settings.value.total) {
      this.flowChartService.settings.patchValue({
        total: false
      })
      this.apply()
      return
    }

    if (params.name == 'Average') {
      return
    }

    this.operationService.viewOperations({
      dateFrom: moment(params.name).format('yyyy-MM-DD'),
      dateTo: moment(params.name).add(1, 'month').format('yyyy-MM-DD'),
      category: {
        id: params.seriesId,
        name: params.seriesName
      }
    })
  }

  apply() {
    this.filter.close()
    this.flowChartService.load()
      .subscribe(result => this.refreshChart(result))
  }

  private refreshChart(flow: FlowChart) {
    this.flow = flow
    this.chartHeight = flow.dates.length * flow.series.length * 2

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
        axisLabel: {
          formatter: (value: string) => {
            return value == 'Average'
              ? 'Average'
              : moment(value).format('MMM YYYY');
          }
        },
        data: flow.dates
      },
      legend: {
        show: true,
        type: 'scroll',
        orient: 'vertical',
        right: '1%',
      },
      grid: {
        left: '15%',
        right: '25%',
        top: '0%',
        bottom: '0%',
      },
      series: flow.series.map(series => {
        return {
          type: 'bar',
          id: series.id,
          name: series.name == 'EXPENSE' ? 'Expense'
              : series.name == 'INCOME' ? 'Income'
              : series.name,
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            borderRadius: 5,
          },
          label: {
            show: true,
            position: 'insideLeft'
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
    this.flowChartService.clearCategories()
  }

}

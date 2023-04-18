import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {ECharts} from "echarts";
import * as echarts from "echarts";
import {FlowGraphChartService} from "../../service/flow-graph-chart.service";
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'flow-graph-chart',
  templateUrl: 'flow-graph-chart.component.html',
  styleUrls: ['flow-graph-chart.component.scss']
})
export class FlowGraphChartComponent implements AfterViewInit, OnDestroy {

  @ViewChild('chart')
  chartContainer!: ElementRef
  chart!: ECharts

  constructor(
    private flowGraphChartService: FlowGraphChartService
  ) {
  }

  ngAfterViewInit(): void {
    let chart = echarts.init(this.chartContainer.nativeElement)
    window.onresize = function () {
      chart.resize()
    }
    this.chart = chart
    this.flowGraphChartService.onLoad.subscribe(() => this.refreshChart())
    this.flowGraphChartService.load()
  }

  ngOnDestroy(): void {
    this.chart.dispose()
  }

  filter(): FormGroup {
    return this.flowGraphChartService.settings
  }

  private refreshChart() {
    let option = {
      series: {
        type: 'sankey',
        layout: 'none',
        layoutIterations: 0,
        emphasis: {
          focus: 'adjacency'
        },
        label: {
          show: false
        },
        data: this.prepareNodes(),
        links: this.prepareLinks()
      }
    }
    this.chart.resize()
    this.chart.clear()
    this.chart.setOption(option)
    console.log(option)
  }

  private prepareNodes(): any[] {
    return this.flowGraphChartService.data.nodes.map(node => {
      return {
        name: node.id,
        depth: node.direction == 'IN' ? 0 : 2,
        value: `${node.direction} ${node.amount} ${node.date}`,
      }
    })
  }

  private prepareLinks(): any[] {
    return this.flowGraphChartService.data.links.map(link => {
      return {
        source: link.source,
        target: link.target,
        value: link.amount
      }
    })
  }

}

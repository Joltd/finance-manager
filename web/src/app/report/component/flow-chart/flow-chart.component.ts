import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FlowChartService} from "../../service/flow-chart.service";
import {FormControl, FormGroup} from "@angular/forms";
import * as echarts from "echarts";
import {ECharts} from "echarts";
import {ReferenceService} from "../../../common/service/reference.service";
import {Reference} from "../../../common/model/reference";
import * as moment from "moment";
import { FlowChart, FlowChartEntry, FlowChartGroup } from "../../model/flow-chart";
import {MatExpansionPanel} from "@angular/material/expansion";
import {Router} from "@angular/router";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {OperationService} from "../../../operation/service/operation.service";
import { and, EntityFilterNode, expression, or } from "../../../entity/model/entity";
import { EntityFilterComponent } from "../../../entity/component/entity-filter/entity-filter.component";
import { MatDialog } from "@angular/material/dialog";
import { EntityService } from "../../../entity/service/entity.service";
import { AxisModel } from "../../../common/model/axis-model";

@Component({
  selector: 'flow-chart',
  templateUrl: 'flow-chart.component.html',
  styleUrls: ['flow-chart.component.scss']
})
export class FlowChartComponent implements AfterViewInit, OnDestroy {

  filter: EntityFilterNode = and([
    expression('date', 'GREATER_EQUALS', moment().subtract(1, 'year').format('yyyy-MM-DD')),
  ])
  groupBy: 'TYPE' | 'CATEGORY' = 'TYPE'
  flow: FlowChart | null = null

  private palette: string[] = [
    '#2ECC71',
    '#3498DB',
    '#E74C3C',
    '#F1C40F',
    '#9B59B6',
    '#E67E22',
    '#16A085',
    '#95A5A6',
    '#ECF0F1'
  ]
  private colorIndex: number = 0
  private colors: { [key: string]: string } = {}
  private axis: AxisModel = new AxisModel()

  constructor(
    private dialog: MatDialog,
    public flowChartService: FlowChartService,
    private operationService: OperationService,
    private entityService: EntityService
  ) {}

  ngAfterViewInit(): void {
    this.apply()
  }

  ngOnDestroy(): void {
  }

  drillDown(group: FlowChartGroup, entry: FlowChartEntry) {
    console.log(group)
    console.log(entry)
    let dateFrom = moment(group.date).format('yyyy-MM-DD')
    let dateTo = moment(group.date).add(1, 'month').format('yyyy-MM-DD')
    if (this.groupBy == 'TYPE') {
      this.operationService.viewOperations(and([
        expression('date', 'GREATER_EQUALS', dateFrom),
        expression('date', 'LESS', dateTo),
        or([
          expression('accountFrom.type', 'IN_LIST', [entry.id]),
          expression('accountTo.type', 'IN_LIST', [entry.id]),
        ]),
      ]))
    } else if (this.groupBy == 'CATEGORY') {
      let account = {
        id: entry.id,
        name: entry.name
      }
      this.operationService.viewOperations(and([
        expression('date', 'GREATER_EQUALS', dateFrom),
        expression('date', 'LESS', dateTo),
        or([
          expression('accountFrom', 'IN_LIST', [account]),
          expression('accountTo', 'IN_LIST', [account]),
        ]),
      ]))
    }
  }

  openFilter() {
    let config = {
      data: {
        fields: this.entityService.getFields('Turnover'),
        filter: this.filter,
      }
    }
    this.dialog.open(EntityFilterComponent, config)
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.filter = result
          this.apply()
        }
      })
  }

  changeGroupBy(groupBy: 'TYPE' | 'CATEGORY') {
    this.groupBy = groupBy
    this.apply()
  }

  apply() {
    this.flowChartService.load(this.filter, this.groupBy == 'CATEGORY')
      .subscribe(result => this.refresh(result))
  }

  private refresh(flow: FlowChart) {
    this.colorIndex = 0
    this.colors = {}
    this.flow = flow
    let values = this.flow.groups
      .flatMap(group => group.entries)
      .map(entry => Math.abs(entry.value))
    this.axis.define(values)
  }

  color(key: string): string {
    let color = this.colors[key]
    if (!color) {
      color = this.colors[key] = this.nextColor()
    }
    return color
  }

  calcWidth(value: number): number {
    return this.axis.calcWidth(Math.abs(value))
  }

  calcOffset(value: number): number {
    return this.axis.calcOffset(Math.abs(value))
  }

  calcValueOffset(value: number): number {
    return this.axis.calcValueOffset(Math.abs(value))
  }

  private nextColor(): string {
    return this.palette[this.colorIndex++ % this.palette.length]
  }

}

import {EventEmitter, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ReferenceService} from "../../common/service/reference.service";
import {FlowGraphChart} from "../model/flow-graph-chart";
import {TypeUtils} from "../../common/service/type-utils";
import {FormControl, FormGroup} from "@angular/forms";
import * as moment from "moment/moment";

@Injectable({
  providedIn: 'root'
})
export class FlowGraphChartService {

  settings: FormGroup = new FormGroup({
    dateFrom: new FormControl(moment('2016-01-01').format('yyyy-MM-DD')),
    dateTo: new FormControl(moment('2016-04-30').format('yyyy-MM-DD')),
    account: new FormControl(),
    currency: new FormControl('RUB')
  })
  data!: FlowGraphChart
  onLoad: EventEmitter<void> = new EventEmitter<void>()

  constructor(
    private http: HttpClient
  ) {
    this.settings.valueChanges.subscribe(() => this.load())
  }

  load() {
    this.http.post<FlowGraphChart>('/flow-graph-chart', this.settings.value, TypeUtils.of(FlowGraphChart))
      .subscribe(result => {
        this.data = result
        this.onLoad.emit()
      })
  }

}

import {EventEmitter, Injectable} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import * as moment from "moment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {FlowChart} from "../model/flow-chart";
import {TypeUtils} from "../../common/service/type-utils";

@Injectable({
  providedIn: 'root'
})
export class FlowChartService {

  settings: FormGroup = new FormGroup({
    dateFrom: new FormControl(moment().subtract(6, 'month').format('yyyy-MM-DD')),
    dateTo: new FormControl(moment().format('yyyy-MM-DD')),
    expenseCategories: new FormControl([]),
    incomeCategories: new FormControl([]),
    currency: new FormControl('RUB'),
    groupBy: new FormControl('month')
  })
  data!: FlowChart
  onLoad: EventEmitter<void> = new EventEmitter<void>()

  constructor(private http: HttpClient) {
    this.settings.valueChanges.subscribe(() => this.load())
  }

  load() {
    this.http.post<FlowChart>('/flow-chart', this.settings.value, TypeUtils.of(FlowChart))
      .subscribe(result => {
        this.data = result
        this.onLoad.emit()
      })
  }

}

import {EventEmitter, Injectable} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import * as moment from "moment";
import {HttpClient} from "@angular/common/http";
import {FlowChart} from "../model/flow-chart";
import {TypeUtils} from "../../common/service/type-utils";
import {ReferenceService} from "../../common/service/reference.service";

@Injectable({
  providedIn: 'root'
})
export class FlowChartService {

  settings: FormGroup = new FormGroup({
    dateFrom: new FormControl(moment().subtract(6, 'month').format('yyyy-MM-DD')),
    dateTo: new FormControl(moment().format('yyyy-MM-DD')),
    groupBy: new FormControl('month'),
    expenseCategories: new FormControl([]),
    incomeCategories: new FormControl([]),
    currency: new FormControl('RUB')
  })
  data!: FlowChart
  onLoad: EventEmitter<void> = new EventEmitter<void>()

  constructor(
    private http: HttpClient,
    private referenceService: ReferenceService
  ) {
    this.settings.valueChanges.subscribe(() => this.load())
    this.referenceService.list('/expense/reference')
      .subscribe(result => this.settings.patchValue({expenseCategories: result.map(reference => reference.id)}))
    this.referenceService.list('/income/reference')
      .subscribe(result => this.settings.patchValue({incomeCategories: result.map(reference => reference.id)}))
  }

  load() {
    this.http.post<FlowChart>('/flow-chart', this.settings.value, TypeUtils.of(FlowChart))
      .subscribe(result => {
        this.data = result
        this.onLoad.emit()
      })
  }

}

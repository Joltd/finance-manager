import {EventEmitter, Injectable} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import * as moment from "moment";
import {HttpClient} from "@angular/common/http";
import {FlowChart} from "../model/flow-chart";
import {TypeUtils} from "../../common/service/type-utils";
import {ReferenceService} from "../../common/service/reference.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FlowChartService {

  constructor(private http: HttpClient) {}

  load(settings: any): Observable<FlowChart> {
    return this.http.post<FlowChart>('/flow-chart', settings, TypeUtils.of(FlowChart))
  }

}

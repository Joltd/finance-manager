import {EventEmitter, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ReferenceService} from "../../common/service/reference.service";
import {FlowGraphChart} from "../model/flow-graph-chart";
import {TypeUtils} from "../../common/service/type-utils";
import {FormControl, FormGroup} from "@angular/forms";
import * as moment from "moment/moment";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FlowGraphChartService {

  constructor(private http: HttpClient) {}

  load(transactionId: string): Observable<FlowGraphChart> {
    return this.http.get<FlowGraphChart>(`/flow-graph-chart/${transactionId}`, TypeUtils.of(FlowGraphChart))
  }

}

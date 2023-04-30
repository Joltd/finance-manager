import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {FlowGraphChart} from "../model/flow-graph-chart";
import {TypeUtils} from "../../common/service/type-utils";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FlowGraphChartService {

  constructor(private http: HttpClient) {}

  load(documentId: string): Observable<FlowGraphChart> {
    return this.http.get<FlowGraphChart>(`/flow-graph-chart/${documentId}`, TypeUtils.of(FlowGraphChart))
  }

}

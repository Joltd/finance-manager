import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {GraphState} from "../model/graph-state";
import {TypeUtils} from "../../common/service/type-utils";

@Injectable({
  providedIn: 'root'
})
export class FundGraphService {

  constructor(private http: HttpClient) {}

  getState(): Observable<GraphState> {
    return this.http.get<GraphState>('/fund-graph', TypeUtils.of(GraphState))
  }

  resetGraph(date: any): Observable<void> {
    return this.http.delete<void>('/fund-graph/' + date.format('YYYY-MM-DD'))
  }

  rebuildGraph(): Observable<void> {
    return this.http.patch<void>('/fund-graph', null)
  }

}

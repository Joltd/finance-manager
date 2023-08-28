import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {FlowChart} from "../model/flow-chart";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FlowChartService {

  constructor(private http: HttpClient) {}

  load(settings: any): Observable<FlowChart> {
    return this.http.post<FlowChart>('/flow-chart', settings)
  }

}

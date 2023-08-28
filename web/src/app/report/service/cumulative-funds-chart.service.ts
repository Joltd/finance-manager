import {ElementRef, Injectable, ViewChild} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CumulativeFundsChart} from "../model/cumulative-funds-chart";
import {MatExpansionPanel} from "@angular/material/expansion";
import {ECharts} from "echarts";
import {FormControl, FormGroup} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class CumulativeFundsChartService {

  constructor(private http: HttpClient) {}

  load(settings: any): Observable<CumulativeFundsChart> {
    return this.http.post<CumulativeFundsChart>('/api/report/current-funds-chart', settings);
  }

}

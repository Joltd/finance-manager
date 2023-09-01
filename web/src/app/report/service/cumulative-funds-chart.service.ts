import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CumulativeFundsChart} from "../model/cumulative-funds-chart";

@Injectable({
  providedIn: 'root'
})
export class CumulativeFundsChartService {

  constructor(private http: HttpClient) {}

  load(settings: any): Observable<CumulativeFundsChart> {
    return this.http.post<CumulativeFundsChart>('/cumulative-funds-chart', settings);
  }

}

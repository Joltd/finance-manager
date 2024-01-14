import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {CurrentFundsChart} from "../model/current-funds-chart";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class CurrentFundsChartService {

  constructor(private http: HttpClient) {}

  load(): Observable<CurrentFundsChart> {
    return this.http.post<CurrentFundsChart>('/current-funds-chart', {})
  }

}

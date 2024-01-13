import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ExchangeRate} from "../model/exchange-rate";

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {

  constructor(private http: HttpClient) {}

  list(): Observable<ExchangeRate[]> {
    return this.http.get<ExchangeRate[]>('/exchange-rate')
  }

  byId(id: string): Observable<ExchangeRate> {
    return this.http.get<ExchangeRate>('/exchange-rate/' + id)
  }

  update(record: any): Observable<void> {
    return this.http.post<void>('/exchange-rate', record)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/exchange-rate/' + id)
  }

  rate(from: string, to: string): Observable<number> {
    let config = {
      params: { from, to }
    }
    return this.http.get<number>('/exchange-rate/rate', config)
  }

}

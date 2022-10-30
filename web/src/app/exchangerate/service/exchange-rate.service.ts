import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ExchangeRate} from "../model/exchange-rate";
import {TypeUtils} from "../../common/service/type-utils";

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {

  constructor(private http: HttpClient) {}

  list(): Observable<ExchangeRate[]> {
    return this.http.get<ExchangeRate[]>('/exchange-rate', TypeUtils.of(ExchangeRate))
  }

  byId(id: string): Observable<ExchangeRate> {
    return this.http.get<ExchangeRate>('/exchange-rate/' + id, TypeUtils.of(ExchangeRate))
  }

  update(record: ExchangeRate): Observable<void> {
    return this.http.post<void>('/exchange-rate', record)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/exchange-rate/' + id)
  }

}

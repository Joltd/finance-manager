import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Currency} from "../model/currency";

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  constructor(private http: HttpClient) {}

  list(): Observable<Currency[]> {
    return this.http.get<Currency[]>('/currency')
  }

  byId(id: string): Observable<Currency> {
    return this.http.get<Currency>('/currency/' + id)
  }

  update(currency: Currency): Observable<void> {
    return this.http.post<void>('/currency', currency)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/currency/' + id)
  }

}

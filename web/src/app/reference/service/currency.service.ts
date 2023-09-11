import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {every, Observable, pipe, tap} from "rxjs";
import {Currency} from "../model/currency";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  currencies: Currency[] = []

  constructor(private http: HttpClient) {}

  load(): Observable<Currency[]> {
    return this.http.get<Currency[]>('/currency')
      .pipe(tap(result => this.currencies = result))
  }

  byId(id: string): Observable<Currency> {
    return this.http.get<Currency>('/currency/' + id)
  }

  update(currency: Currency): Observable<void> {
    return this.http.post<void>('/currency', currency)
      .pipe(tap(() => this.load().subscribe()))
  }

  delete(id: string) {
    this.http.delete<void>('/currency/' + id)
      .subscribe(() => this.load().subscribe())
  }

}

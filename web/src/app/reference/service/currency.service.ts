import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Currency} from "../model/currency";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  currencies: Currency[] = []

  constructor(private http: HttpClient) {}

  load() {
    this.http.get<Currency[]>('/currency')
      .subscribe(result => this.currencies = result)
  }

  byId(id: string): Observable<Currency> {
    return this.http.get<Currency>('/currency/' + id)
  }

  update(currency: Currency): Observable<void> {
    return this.http.post<void>('/currency', currency)
      .pipe(map(result => {
        this.load()
        return result
      }))
  }

  delete(id: string) {
    this.http.delete<void>('/currency/' + id)
      .subscribe(() => this.load())
  }

}

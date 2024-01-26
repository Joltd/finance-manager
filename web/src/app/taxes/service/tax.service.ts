import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Operation } from "../../operation/model/operation";
import { HttpClient } from "@angular/common/http";
import { Amount } from "../../common/model/amount";

@Injectable({
  providedIn: "root"
})
export class TaxService {

  constructor(private http: HttpClient) {}

  yearTotal(date: string, currency: string): Observable<Amount> {
    return this.http.get<Amount>(`/tax/year?date=${date}&currency=${currency}`)
  }

  listIncomes(date: string): Observable<Operation[]> {
    return this.http.get<Operation[]>(`/tax/income?date=${date}`)
  }

  save(tax: any): Observable<any> {
    return this.http.post<any>("/tax", tax);
  }

}

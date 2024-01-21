import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Operation } from "../../operation/model/operation";
import { HttpClient } from "@angular/common/http";
import { Amount } from "../../common/model/amount";

@Injectable({
  providedIn: "root"
})
export class TaxesService {

  constructor(private http: HttpClient) {}

  yearTax(date: string, currency: string): Observable<Amount> {
    return this.http.get<Amount>(`/taxes/year?date=${date}&currency=${currency}`)
  }

  listIncomes(date: string): Observable<Operation[]> {
    return this.http.get<Operation[]>(`/taxes/income?date=${date}`)
  }

}

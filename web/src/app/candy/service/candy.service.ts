import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CandyDashboard, CandyExpense } from "../model/candy";

@Injectable({
  providedIn: 'root'
})
export class CandyService {

  constructor(private http: HttpClient) {}

  dashboard(): Observable<CandyDashboard> {
    return this.http.get<CandyDashboard>('/candy/dashboard')
  }

  expense(expense: any): Observable<void> {
    return this.http.post<void>('/candy/expense', expense)
  }
}

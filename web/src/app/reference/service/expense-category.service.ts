import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ExpenseCategory} from "../module/expense-category";
import {TypeUtils} from "../../common/service/type-utils";

@Injectable({
  providedIn: 'root'
})
export class ExpenseCategoryService {

  constructor(private http: HttpClient) {}

  list(): Observable<ExpenseCategory[]> {
    return this.http.get<ExpenseCategory[]>('/expense', TypeUtils.of(ExpenseCategory))
  }

  bytId(id: string): Observable<ExpenseCategory> {
    return this.http.get<ExpenseCategory>('/expense/' + id, TypeUtils.of(ExpenseCategory))
  }

  update(expenseCategory: ExpenseCategory): Observable<void> {
    return this.http.post<void>('/expense', expenseCategory)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/expense/' + id)
  }

}

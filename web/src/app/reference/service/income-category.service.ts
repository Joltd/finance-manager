import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {TypeUtils} from "../../common/service/type-utils";
import {IncomeCategory} from "../model/income-category";
import {Usage} from "../model/usage";

@Injectable({
  providedIn: 'root'
})
export class IncomeCategoryService {

  constructor(private http: HttpClient) {}

  list(): Observable<IncomeCategory[]> {
    return this.http.get<IncomeCategory[]>('/income', TypeUtils.of(IncomeCategory))
  }

  bytId(id: string): Observable<IncomeCategory> {
    return this.http.get<IncomeCategory>('/income/' + id, TypeUtils.of(IncomeCategory))
  }

  update(IncomeCategory: IncomeCategory): Observable<void> {
    return this.http.post<void>('/income', IncomeCategory)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/income/' + id)
  }

  usage(id: string): Observable<Usage> {
    return this.http.get<Usage>('/transaction/usage/expense/' + id)
  }

}

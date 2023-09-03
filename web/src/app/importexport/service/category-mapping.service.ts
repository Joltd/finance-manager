import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CategoryMapping, CategoryMappingPage} from "../model/category-mapping";

@Injectable({
  providedIn: 'root'
})
export class CategoryMappingService {

  constructor(private http: HttpClient) {}

  list(filter: any): Observable<CategoryMappingPage> {
    return this.http.post<CategoryMappingPage>('/category-mapping/filter', filter)
  }

  byId(id: string): Observable<CategoryMapping> {
    return this.http.get<CategoryMapping>('/category-mapping/' + id)
  }

  update(categoryMapping: CategoryMapping): Observable<void> {
    return this.http.post<void>('/category-mapping', categoryMapping)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/category-mapping/' + id)
  }

}

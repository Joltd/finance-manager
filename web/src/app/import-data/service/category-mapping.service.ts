import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {CategoryMapping, CategoryMappingPage} from "../model/category-mapping";
import {HttpClient} from "@angular/common/http";
import {TypeUtils} from "../../common/service/type-utils";

@Injectable()
export class CategoryMappingService {

  constructor(private http: HttpClient) {}

  list(filter: any): Observable<CategoryMappingPage> {
    return this.http.post<CategoryMappingPage>('/category-mapping/list', filter, TypeUtils.of(CategoryMappingPage))
  }

  byId(id: string): Observable<CategoryMapping> {
    return this.http.get<CategoryMapping>('/category-mapping/' + id, TypeUtils.of(CategoryMapping))
  }

  update(categoryMapping: CategoryMapping): Observable<void> {
    return this.http.post<void>('/category-mapping', categoryMapping)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>('/category-mapping/' + id)
  }

}

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Entity, EntityPage } from "../model/entity";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  constructor(private http: HttpClient) {}

  entityList(): Observable<Entity[]> {
    return this.http.get<Entity[]>('/entity')
  }

  list(name: string): Observable<EntityPage> {
    return this.http.post<EntityPage>('/entity/' + name, {})
  }

}

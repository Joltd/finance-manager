import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Entity, EntityFilterCondition, EntityPage, EntitySortEntry } from "../model/entity";
import { lastValueFrom, Observable } from "rxjs";
import { Reference } from "../../common/model/reference";

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  entities: Entity[] = []
  entity!: Entity
  filter: EntityFilterCondition[] = []
  sort: EntitySortEntry[] = []
  page: EntityPage = {
    total: 0,
    page: 0,
    size: 20,
    values: []
  }

  constructor(private http: HttpClient) {}

  async entityLoad() {
    if (this.entities.length == 0) {
      this.entities = await lastValueFrom(this.entityList())
    }
  }

  async setEntity(name: string) {
    await this.entityLoad()
    this.entity = this.entities.find(entity => entity.name == name)!
  }

  async load() {
    this.page = await lastValueFrom(this.list())
  }

  private entityList(): Observable<Entity[]> {
    return this.http.get<Entity[]>('/entity')
  }

  private list(): Observable<EntityPage> {
    let request = {
      page: this.page.page,
      size: this.page.size,
      sort: this.sort,
      filter: this.filter
    }
    return this.http.post<EntityPage>('/entity/' + this.entity.name + '/list', request)
  }

  referenceList(name: string): Observable<Reference[]> {
    return this.http.get<Reference[]>('/entity/' + name + '/reference')
  }

  byId(id: string): Observable<any> {
    return this.http.get('/entity/' + this.entity.name + '/' + id)
  }

  update(value: any): Observable<void> {
    return this.http.post<void>('/entity/' + this.entity.name, value)
  }

  delete(id: any): Observable<void> {
    return this.http.delete<void>('/entity/' + this.entity.name + '/' + id)
  }

}

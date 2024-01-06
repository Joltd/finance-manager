import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Entity, EntityFilterEntry, EntityPage, EntitySortEntry } from "../model/entity";
import { lastValueFrom, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  entities: Entity[] = []
  entity!: Entity
  filter: EntityFilterEntry[] = []
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
    }
    return this.http.post<EntityPage>('/entity/' + this.entity.name, request)
  }

  delete(id: any): Observable<void> {
    return this.http.delete<void>('/entity/' + this.entity.name + '/' + id)
  }

}

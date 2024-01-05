import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Entity, EntityPage } from "../model/entity";
import { lastValueFrom, Observable } from "rxjs";
import { ArrayDataSource } from "@angular/cdk/collections";

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  entities: Entity[] = []
  entity!: Entity
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

  async load(page: number | null, size: number | null) {
    this.page = await lastValueFrom(this.list(
      this.entity.name,
      page || this.page.page,
      size || this.page.size
    ))
  }

  private entityList(): Observable<Entity[]> {
    return this.http.get<Entity[]>('/entity')
  }

  private list(name: string, page: number, size: number): Observable<EntityPage> {
    return this.http.post<EntityPage>('/entity/' + name, { page, size })
  }

}

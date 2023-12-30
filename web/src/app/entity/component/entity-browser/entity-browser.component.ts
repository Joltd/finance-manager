import { Component, OnInit } from "@angular/core";
import { EntityService } from "../../service/entity.service";
import { ActivatedRoute } from "@angular/router";
import { Entity, EntityPage } from "../../model/entity";

@Component({
  selector: 'entity-browser',
  templateUrl: 'entity-browser.component.html',
  styleUrls: ['entity-browser.component.scss']
})
export class EntityBrowserComponent implements OnInit {

  entities: Entity[] = []
  entity!: Entity
  page: EntityPage = {
    total: 0,
    page: 0,
    size: 20,
    values: []
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private entityService: EntityService
  ) {
    this.entityService.entityList()
      .subscribe(result => {
        this.entities = result
        this.activatedRoute.params.subscribe(params => {
          let name = params['name']
          this.entity = this.entities.find(entity => entity.name == name)!
          this.entityService.list(name)
            .subscribe(result => this.page = result)
        })
      })
  }

  ngOnInit(): void {
    this.load()
  }

  load() {

  }

  openFilter() {

  }

  openSort() {

  }

  openEntityAction() {

  }

  add() {

  }

  edit() {

  }

  delete() {

  }

}

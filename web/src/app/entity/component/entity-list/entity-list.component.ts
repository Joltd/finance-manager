import { Component, OnInit } from "@angular/core";
import { EntityService } from "../../service/entity.service";
import { Entity } from "../../model/entity";
import { Router } from "@angular/router";

@Component({
  selector: 'entity-list',
  templateUrl: 'entity-list.component.html',
  styleUrls: ['entity-list.component.scss']
})
export class EntityListComponent implements OnInit {

  entities: Entity[] = []

  constructor(
    private entityService: EntityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.onInit().then()
  }

  private async onInit() {
    await this.entityService.entityLoad()
    this.entities = this.entityService.entities
  }

  openEntity(entity: Entity) {
    this.router.navigate(['entity', entity.name]).then()
  }

}

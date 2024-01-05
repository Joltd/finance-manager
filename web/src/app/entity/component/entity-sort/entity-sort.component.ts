import { Component } from "@angular/core";
import { EntityService } from "../../service/entity.service";

@Component({
  selector: 'entity-sort',
  templateUrl: 'entity-sort.component.html',
  styleUrls: ['entity-sort.component.scss']
})
export class EntitySortComponent {

  constructor(
    private entityService: EntityService
  ) {}

  apply() {

  }

  close() {

  }

  add() {

  }

}

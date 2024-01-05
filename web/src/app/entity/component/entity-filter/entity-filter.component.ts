import { Component } from "@angular/core";
import { EntityService } from "../../service/entity.service";

@Component({
  selector: 'entity-filter',
  templateUrl: 'entity-filter.component.html',
  styleUrls: ['entity-filter.component.scss']
})
export class EntityFilterComponent {

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

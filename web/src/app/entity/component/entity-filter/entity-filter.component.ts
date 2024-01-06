import { Component } from "@angular/core";
import { EntityService } from "../../service/entity.service";
import { Entity, EntityFilterEntry, EntityFilterOperator } from "../../model/entity";

@Component({
  selector: 'entity-filter',
  templateUrl: 'entity-filter.component.html',
  styleUrls: ['entity-filter.component.scss']
})
export class EntityFilterComponent {

  constructor(
    private entityService: EntityService
  ) {}

  entity(): Entity {
    return this.entityService.entity
  }

  filters(): EntityFilterEntry[] {
    return this.entityService.filter
  }

  operators(): EntityFilterOperator[] {
    return [
      { name: 'EQUALS', label: 'Equals' },
      { name: 'GREATER', label: 'Greater than' },
      { name: 'LESS', label: 'Less than' },
      { name: 'GREATER_OR_EQUALS', label: 'Greater or equals than' },
      { name: 'LESS_OR_EQUALS', label: 'Less or equals than' },
      { name: 'LIKE', label: 'Like' },
      { name: 'IN', label: 'In' },
    ]
  }

  apply() {

  }

  close() {

  }

  add() {
    this.entityService.filter.push({
      id: ''+Math.random(),
      field: '',
      operator: '',
      value: null
    })
  }

}

import { Component, Input } from "@angular/core";
import { Entity, EntityFilterCondition } from "../../model/entity";

@Component({
  selector: 'entity-filter-condition',
  templateUrl: './entity-filter-condition.component.html',
  styleUrls: ['./entity-filter-condition.component.scss']
})
export class EntityFilterConditionComponent {

  @Input()
  entity!: Entity

  @Input()
  condition!: EntityFilterCondition

}

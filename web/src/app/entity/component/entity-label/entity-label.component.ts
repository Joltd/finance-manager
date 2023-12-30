import { Component, Input } from "@angular/core";
import { Entity } from "../../model/entity";

@Component({
  selector: 'entity-label',
  templateUrl: 'entity-label.component.html',
  styleUrls: ['entity-label.component.scss']
})
export class EntityLabelComponent {

  @Input()
  entity!: Entity

  @Input()
  value: any

}

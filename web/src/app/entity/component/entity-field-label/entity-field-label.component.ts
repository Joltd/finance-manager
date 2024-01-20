import { Component, Input } from "@angular/core";
import { EntityFieldType } from "../../model/entity";

@Component({
  selector: 'entity-field-label',
  templateUrl: 'entity-field-label.component.html',
  styleUrls: ['entity-field-label.component.scss']
})
export class EntityFieldLabelComponent {

  @Input()
  type!: EntityFieldType

  @Input()
  value: any

}

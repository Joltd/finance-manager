import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'entity-filter-input',
  templateUrl: 'entity-filter-input.component.html',
  styleUrls: ['entity-filter-input.component.scss']
})
export class EntityFilterInputComponent {

  @Input()
  type!: string

  @Input()
  value: any

  @Output()
  valueChange: EventEmitter<any> = new EventEmitter<any>()

}

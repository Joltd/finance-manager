import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: 'entry-item',
  templateUrl: 'entry-item.component.html',
  styleUrls: ['entry-item.component.scss']
})
export class EntryItemComponent {

  @Input()
  value: any

  @Output()
  select: EventEmitter<any> = new EventEmitter<any>()

}

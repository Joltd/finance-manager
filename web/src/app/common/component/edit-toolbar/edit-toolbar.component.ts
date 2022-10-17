import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: 'edit-toolbar',
  templateUrl: 'edit-toolbar.component.html',
  styleUrls: ['edit-toolbar.component.scss']
})
export class EditToolbarComponent {

  @Input()
  title: string = ''

  @Output()
  save: EventEmitter<void> = new EventEmitter<void>()

  @Output()
  close: EventEmitter<void> = new EventEmitter<void>()

}

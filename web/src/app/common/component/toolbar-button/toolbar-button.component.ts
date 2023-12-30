import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'toolbar-button',
  templateUrl: 'toolbar-button.component.html',
  styleUrls: ['toolbar-button.component.scss']
})
export class ToolbarButtonComponent {

  @Input()
  name!: string

  @Input()
  icon!: string

  @Output()
  click: EventEmitter<void> = new EventEmitter<void>()

}

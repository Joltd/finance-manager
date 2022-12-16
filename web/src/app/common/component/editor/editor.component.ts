import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: 'editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.scss']
})
export class EditorComponent {

  @Input()
  title: string = 'Editor'

  @Input()
  saveHidden: boolean = false

  @Input()
  saveDisabled: boolean = false

  @Output()
  onSave: EventEmitter<void> = new EventEmitter<void>()

  @Input()
  closeHidden: boolean = false

  @Input()
  closeDisabled: boolean = false

  @Output()
  onClose: EventEmitter<void> = new EventEmitter<void>()

  save() {
    this.onSave?.emit()
  }

  close() {
    this.onClose?.emit()
  }

}

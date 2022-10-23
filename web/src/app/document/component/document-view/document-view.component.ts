import {Component, EventEmitter, Input, Output} from "@angular/core";
import {Document} from "../../model/document";
import {DocumentTyped} from "../../model/document-typed";

@Component({
  selector: 'document-view',
  templateUrl: 'document-view.component.html',
  styleUrls: ['document-view.component.scss']
})
export class DocumentViewComponent {

  @Input()
  type!: string

  @Input()
  document!: Document

  @Output()
  onSave: EventEmitter<DocumentTyped> = new EventEmitter<DocumentTyped>()

  @Output()
  onClose: EventEmitter<void> = new EventEmitter<void>()

  save(document: DocumentTyped) {
    this.onSave.emit(document)
  }

  close() {
    this.onClose.emit()
  }

}

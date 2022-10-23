import {Component, Input} from "@angular/core";
import {DocumentTyped} from "../../model/document-typed";

@Component({
  selector: 'document-label',
  templateUrl: 'document-label.component.html',
  styleUrls: ['document-label.component.scss']
})
export class DocumentLabelComponent {

  @Input()
  document!: DocumentTyped

}

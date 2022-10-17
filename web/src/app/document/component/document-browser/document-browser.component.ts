import {Component} from "@angular/core";
import {DocumentService} from "../../service/document.service";
import {Document} from "../../model/document";

@Component({
  selector: 'document-browser',
  templateUrl: 'document-browser.component.html',
  styleUrls: [
    'document-browser.component.scss'
  ]
})
export class DocumentBrowserComponent {

  documents: Document[] = []

  constructor(private documentService: DocumentService) {}

  list() {
    this.documentService.list().subscribe(result => this.documents = result)
  }

  add() {

  }

}

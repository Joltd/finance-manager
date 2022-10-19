import {Component, OnInit} from "@angular/core";
import {DocumentService} from "../../service/document.service";
import {Document} from "../../model/document";
import {Router} from "@angular/router";

@Component({
  selector: 'document-browser',
  templateUrl: 'document-browser.component.html',
  styleUrls: ['document-browser.component.scss']
})
export class DocumentBrowserComponent implements OnInit {

  documents: Document[] = []

  constructor(
    private router: Router,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.documentService.list().subscribe(result => this.documents = result)
  }

  add() {
    this.router.navigate(['document', 'expense', 'new']).then()
  }

  edit(id: string) {
    this.router.navigate(['document', 'expense', id]).then()
  }

  delete(id: string) {
    this.documentService.delete(id).subscribe(() => this.load())
  }

}

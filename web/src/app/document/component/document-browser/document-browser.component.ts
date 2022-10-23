import {Component, OnInit, ViewChild} from "@angular/core";
import {DocumentService} from "../../service/document.service";
import {DocumentRow} from "../../model/document-row";
import {Router} from "@angular/router";
import {MatMenuTrigger} from "@angular/material/menu";
import {trigger} from "@angular/animations";

@Component({
  selector: 'document-browser',
  templateUrl: 'document-browser.component.html',
  styleUrls: ['document-browser.component.scss']
})
export class DocumentBrowserComponent implements OnInit {

  documents: DocumentRow[] = []
  selection: boolean = false

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

  select() {
    this.selection = true
  }

  add(type: string) {
    this.router.navigate(['document', type]).then()
  }

  edit(id: string) {
    this.router.navigate(['document', id]).then()
  }

  delete(id: string) {
    this.documentService.delete(id).subscribe(() => this.load())
  }

}

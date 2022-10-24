import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {DocumentService} from "../../service/document.service";
import {Document} from "../../model/document";
import {DocumentTyped} from "../../model/document-typed";

@Component({
  selector: 'document-edit',
  templateUrl: 'document-editor.component.html',
  styleUrls: ['document-editor.component.scss']
})
export class DocumentEditorComponent {

  private id!: string
  type!: string
  document!: Document

  constructor(
    private activatedRoute: ActivatedRoute,
    private documentService: DocumentService,
    private router: Router
  ) {
    this.activatedRoute.params
      .subscribe(params => {
        let id = params['id']
        if (id == 'expense' || id == 'income' || id == 'exchange') {
          this.type = id
          // this.document = {
          //   date: '',
          //   description: ''
          // }
        } else {
          this.id = id
          this.load()
        }
      })
  }

  private load() {
    this.documentService.byId(this.id)
      .subscribe(result => {
        this.type = result.type
        this.document = result.value
      })
  }

  save(document: DocumentTyped) {
    this.documentService.update(document)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['import-data']).then()
  }

}

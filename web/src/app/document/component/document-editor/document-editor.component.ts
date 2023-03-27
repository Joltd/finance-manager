import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {DocumentService} from "../../service/document.service";
import {Document} from "../../model/document";
import {DocumentTyped} from "../../model/document-typed";
import * as moment from "moment";

@Component({
  selector: 'document-edit',
  templateUrl: 'document-editor.component.html',
  styleUrls: ['document-editor.component.scss']
})
export class DocumentEditorComponent {

  private id!: string
  type!: string
  document: Document = {
    id: null,
    date: moment().format('yyyy-MM-DD')
  }

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
          return
        }

        this.activatedRoute.queryParams.subscribe(queryParams => {
          let copy = queryParams['copy']
          this.documentService.byId(id)
            .subscribe(result => {
              this.type = result.type
              this.document = result.value
              if (copy) {
                this.document.id = null
              } else {
                this.id = id
              }
            })
        })
      })
  }

  save(document: DocumentTyped) {
    this.documentService.update(document)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['document']).then()
  }

}

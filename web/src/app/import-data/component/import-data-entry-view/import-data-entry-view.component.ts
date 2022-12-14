import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ImportDataService} from "../../service/import-data.service";
import {ImportDataEntry} from "../../model/import-data-old";
import {DocumentTyped} from "../../../document/model/document-typed";

@Component({
  selector: 'import-data-entry-view',
  templateUrl: 'import-data-entry-view.component.html',
  styleUrls: ['import-data-entry-view.component.scss']
})
export class ImportDataEntryViewComponent {

  private id!: string
  private entryId!: string
  entry!: ImportDataEntry

  document: DocumentTyped | null = null
  create: boolean = false

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private importDataService: ImportDataService
  ) {
    this.activatedRoute.params
      .subscribe(params => {
        this.id = params['id']
        this.entryId = params['entryId']
        this.load()
      })
  }

  private load() {
    this.importDataService.entryById(this.id, this.entryId)
      .subscribe(result => this.entry = result)
  }

  save() {
    this.importDataService.entryUpdate(this.id, this.entryId, this.entry)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['import-data', this.id]).then()
  }

  viewDocument(document: DocumentTyped) {
    this.document = document
    this.create = false
  }

  createDocument(type: string) {
    this.document = new DocumentTyped()
    this.document.type = type
    this.document.value = {
      id: null,
      date: ''
    }
    this.create = true
  }

  saveDocument(document: DocumentTyped) {
    if (!this.create) {
      this.closeDocument()
      return
    }

    this.entry.suggested = document
    this.importDataService.entryUpdate(this.id, this.entryId, this.entry)
      .subscribe(() => {
        this.closeDocument()
        this.load()
      })
  }

  closeDocument() {
    this.document = null
    this.create = false
  }

  selectForRemove() {
    this.router.navigate(['import-data',this.id,'entry',this.entryId,'for-remove']).then()
  }

  clearForRemove() {
    this.entry.forRemove = []
  }

}

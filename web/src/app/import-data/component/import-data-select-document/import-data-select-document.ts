import {Component} from "@angular/core";
import {ImportDataService} from "../../service/import-data.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup} from "@angular/forms";
import {DocumentService} from "../../../document/service/document.service";
import {DocumentTyped} from "../../../document/model/document-typed";
import {ImportDataEntryForRemove} from "../../model/import-data-old";

@Component({
  selector: 'import-data-select-document',
  templateUrl: 'import-data-select-document.html',
  styleUrls: ['import-data-select-document.scss']
})
export class ImportDataSelectDocument {

  private id!: string
  private entryId!: string
  forRemove: Set<string> = new Set<string>()
  filter: FormGroup = new FormGroup({
    date: new FormControl(null),
    account: new FormControl(null)
  })
  documents: DocumentTyped[] = []

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private importDataService: ImportDataService,
    private documentService: DocumentService
  ) {
    this.activatedRoute.params
      .subscribe(params => {
        this.id = params['id']
        this.entryId = params['entryId']
        this.load()
      })
    this.filter.valueChanges.subscribe(() => this.loadDocuments())
  }

  private load() {
    this.importDataService.forRemove(this.id, this.entryId)
      .subscribe(result => {
        this.forRemove.clear()
        result.documents.forEach(id => this.forRemove.add(id))
      })
  }

  private loadDocuments() {
    let date = this.filter.value.date
    let account = this.filter.value.account
    if (!date || !account) {
      return
    }
    this.documentService.listDaily(date, account)
      .subscribe(result => this.documents = result)
  }

  save() {
    if (this.filter.value.date == null || this.filter.value.account == null) {
      return
    }

    let forRemove = new ImportDataEntryForRemove()
    this.forRemove.forEach(document => forRemove.documents.push(document))
    this.importDataService.forRemoveUpdate(this.id, this.entryId, forRemove)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['import-data', this.id, 'entry', this.entryId]).then()
  }

  isDocumentSelected(document: DocumentTyped): boolean {
    return document.value.id != null && this.forRemove.has(document.value.id)
  }

  selectDocument(document: DocumentTyped, checked: boolean) {
    let id = document.value.id
    if (id == null) {
      return
    }

    if (checked) {
      this.forRemove.add(id)
    } else {
      this.forRemove.delete(id)
    }
  }
}

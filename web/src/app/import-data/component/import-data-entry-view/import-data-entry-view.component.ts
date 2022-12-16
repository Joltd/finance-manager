import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ImportDataService} from "../../service/import-data.service";
import {ImportDataEntry} from "../../model/import-data";
import {DocumentTyped} from "../../../document/model/document-typed";
import {FormControl, FormGroup} from "@angular/forms";
import {DocumentService} from "../../../document/service/document.service";
import {DocumentExpense, DocumentIncome} from "../../../document/model/document";

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

  select: boolean = false
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
    this.importDataService.entryById(this.id, this.entryId)
      .subscribe(result => {
        this.entry = result
        let suggested = this.entry.suggested
        if (suggested != null) {
          this.filter.patchValue({date: suggested.value.date})
          if (suggested.type == 'expense') {
            this.filter.patchValue({account: (suggested.value as DocumentExpense).account})
          } else if (suggested.type == 'income') {
            this.filter.patchValue({account: (suggested.value as DocumentIncome).account})
          }
        }
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

  isDocumentSelected(document: DocumentTyped): boolean {
    return this.entry.forRemove?.value?.id == document.value.id
  }

  selectDocument(document: DocumentTyped, checked: boolean) {
    let id = document.value.id
    if (id == null) {
      return
    }

    if (checked) {
      this.entry.forRemove = document
    } else {
      this.entry.forRemove = null
    }
  }

}

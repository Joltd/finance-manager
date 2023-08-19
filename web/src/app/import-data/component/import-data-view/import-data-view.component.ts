import {Component, HostBinding, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ImportData, ImportDataEntry, ImportDataEntryPage} from "../../model/import-data";
import {ImportDataService} from "../../service/import-data.service";
import {SettingsService} from "../../../settings/service/settings.service";
import {PageEvent} from "@angular/material/paginator";
import {DocumentTyped} from "../../../document/model/document-typed";
import {MatTabGroup} from "@angular/material/tabs";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'import-data-view',
  templateUrl: 'import-data-view.component.html',
  styleUrls: ['import-data-view.component.scss']
})
export class ImportDataViewComponent implements OnInit,OnDestroy {

  private id!: string
  importData!: ImportData
  page: ImportDataEntryPage = {
    total: 0,
    page: 0,
    size: 10,
    entries: []
  }
  entry: ImportDataEntry | null = null

  entriesFilter: FormGroup = new FormGroup({
    preparationResult: new FormControl(null),
    option: new FormControl(null),
    importResult: new FormControl(null)
  })

  @HostBinding('class.host-document')
  suggestedDocument: DocumentTyped | null = null

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private importDataService: ImportDataService,
    private settingsService: SettingsService
  ) {
    this.settingsService.wideScreenToggle = false
    this.entriesFilter.valueChanges.subscribe(() => {
      this.page.page = 0
      this.loadEntries()
    })
    this.activatedRoute.params
      .subscribe(params => {
        this.id = params['id']
        this.load()
      })
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.settingsService.wideScreenToggle = true
  }

  private load() {
    this.importDataService.byId(this.id)
      .subscribe(result => {
        this.importData = result
        this.loadEntries()
      })
  }

  private loadEntries() {
    let preparationResult = this.entriesFilter.value.preparationResult
    let option = preparationResult == false ? null : this.entriesFilter.value.option
    let importResult = option == 'SKIP' || option == 'NONE' ? null : this.entriesFilter.value.importResult
    let request = {
      page: this.page.page,
      size: this.page.size,
      preparationResult: preparationResult,
      option: option,
      importResult: importResult
    }
    this.importDataService.entryList(this.id, request)
      .subscribe(result => {
        this.page = result
        if (this.entry == null && this.page.entries.length > 0) {
          this.entry = this.page.entries[0]
        } else {
          this.entry = null
        }
      })
  }

  onPage(event: PageEvent) {
    this.page.page = event.pageIndex
    this.loadEntries()
  }

  viewEntry(entry: ImportDataEntry) {
    this.entry = entry
  }

  save() {

  }

  close() {
    this.router.navigate(['import-data']).then()
  }

  changeOption(option: 'NONE' | 'CREATE_NEW' | 'SKIP' | 'REPLACE') {
    if (this.entry == null) {
      return
    }
    this.entry.option = option
    let request = {
      entryId: this.entry.id,
      option: option
    }
    this.importDataService.entryUpdate(this.id, request)
      .subscribe(() => {})
  }

  newSuggestedDocument(type: string) {
    if (this.entry == null) {
      return
    }
    this.suggestedDocument = new DocumentTyped()
    this.suggestedDocument.type = type
    this.suggestedDocument.value = {
      id: null,
      date: this.entry?.parsedEntry.date
    }
  }

  viewSuggestedDocument() {
    if (this.entry?.suggestedDocument == null) {
      return
    }
    this.suggestedDocument = this.entry.suggestedDocument
  }

  closeSuggestedDocument() {
    this.suggestedDocument = null
  }

  saveSuggestedDocument(document: DocumentTyped) {
    if (this.entry != null) {
      this.entry.suggestedDocument = document
      let request = {
        entryId: this.entry.id,
        suggestedDocument: document
      }
      this.importDataService.entryUpdate(this.id, request)
        .subscribe(() => {})
    }
    this.closeSuggestedDocument()
  }

}


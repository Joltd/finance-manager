import {Component, EventEmitter} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ImportData, DocumentEntry} from "../../model/import-data";
import {ImportDataService} from "../../service/import-data.service";
import {DocumentTyped} from "../../../document/model/document-typed";

@Component({
  selector: 'import-data-view',
  templateUrl: 'import-data-view.component.html',
  styleUrls: ['import-data-view.component.scss']
})
export class ImportDataViewComponent {

  private id!: string
  importData: ImportData = new ImportData()
  dateGroups: DateGroup[] = []

  entry: DocumentEntry | null = null
  document!: DocumentTyped

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private importDataService: ImportDataService
  ) {
    this.activatedRoute.params
      .subscribe(params => {
        this.id = params['id']
        this.load()
      })
  }

  load() {
    this.importDataService.byId(this.id)
      .subscribe(result => {
        this.importData = result
        let dateGroups: Map<string, DateGroup> = new Map()

        for (let document of result.documents) {
          let date = document.suggested.value.date;
          let dateGroup = dateGroups.get(date)
          if (!dateGroup) {
            dateGroup = new DateGroup()
            dateGroup.date = date
            dateGroups.set(date, dateGroup)
          }
          let dateGroupEntry = new DateGroupEntry()
          dateGroupEntry.source = document.source
          dateGroupEntry.suggested = document.suggested
          dateGroupEntry.existed = document.existed
          dateGroup.entries.push(dateGroupEntry)
        }

        for (let document of result.other) {
          let date = document.value.date;
          let dateGroup = dateGroups.get(date)
          if (!dateGroup) {
            dateGroup = new DateGroup()
            dateGroup.date = date
            dateGroups.set(date, dateGroup)
          }
          let dateGroupEntry = new DateGroupEntry()
          dateGroupEntry.existed = document
          dateGroup.entries.push(dateGroupEntry)
        }

        this.dateGroups = []
        for (let dateGroup of dateGroups.values()) {
          this.dateGroups.push(dateGroup)
        }
        this.dateGroups.sort((left,right) => left.date > right.date ? 1 : -1)
      })
  }

  viewDocument(entry: DocumentEntry) {
    this.entry = entry
    this.document = entry.suggested
  }

  createDocument(entry: DocumentEntry, type: string) {
    this.entry = entry
    this.document = new DocumentTyped()
    this.document.type = type
    this.document.value = {
      date: entry.suggested.value.date,
      description: ''
    }
  }

  saveDocument(document: DocumentTyped) {
    if (this.entry == null) {
      return
    }
    this.entry.suggested = document
    this.entry = null
  }

  closeDocument() {
    this.entry = null
  }

  save() {
    // let selected = this.importData.entries.filter(entry => entry.selected)
    // if (selected.length == 0) {
    //   return
    // }
    //
    // this.importDataService.performImport(this.importData.account, selected)
    //   .subscribe(() => this.load())
  }

  close() {
    this.router.navigate(['import-data']).then()
  }

}

class DateGroup {
  date!: string
  entries: DateGroupEntry[] = []
}

class DateGroupEntry {
  source!: string
  suggested!: DocumentTyped
  existed!: DocumentTyped
}

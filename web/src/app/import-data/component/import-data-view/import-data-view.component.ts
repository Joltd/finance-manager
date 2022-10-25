import {Component} from "@angular/core";
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
  document: DocumentTyped | null = null
  create: boolean = false
  suggestedDocumentCount: number = 0
  allDocumentCount: number = 0
  toggleSelectionState: boolean = false
  hideImported: boolean = false

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
    this.dateGroups = []
    this.entry = null
    this.document = null
    this.suggestedDocumentCount = 0
    this.allDocumentCount = 0
    this.importDataService.byId(this.id)
      .subscribe(result => {
        this.importData = result
        let dateGroups: Map<string, DateGroup> = new Map()

        for (let document of result.documents) {
          let date = document.suggested?.value?.date || 'Other'
          let dateGroup = this.dateGroup(dateGroups, date)
          let dateGroupEntry = new DateGroupEntry()
          dateGroupEntry.id = document.id
          dateGroupEntry.source = document.source
          dateGroupEntry.suggested = document.suggested
          dateGroupEntry.existed = document.existed
          dateGroup.entries.push(dateGroupEntry)

          if (document.suggested) {
            this.suggestedDocumentCount++
          }
          this.allDocumentCount++
        }

        for (let document of result.other) {
          let date = document.value.date;
          let dateGroup = this.dateGroup(dateGroups, date)
          let dateGroupEntry = new DateGroupEntry()
          dateGroupEntry.existed = document
          dateGroup.entries.push(dateGroupEntry)
        }

        for (let dateGroup of dateGroups.values()) {
          this.dateGroups.push(dateGroup)
        }
        this.dateGroups.sort((left,right) => {
          if (left.date == 'Other') {
            return -1
          } else if (right.date == 'Other') {
            return 1
          } else if (left.date > right.date) {
            return 1
          } else {
            return -1
          }
        })
      })
  }

  private dateGroup(dateGroups: Map<string, DateGroup>, date: string): DateGroup {
    let dateGroup = dateGroups.get(date)
    if (!dateGroup) {
      dateGroup = new DateGroup()
      dateGroup.date = date
      dateGroups.set(date, dateGroup)
    }
    return dateGroup
  }

  viewDocument(entry: DocumentEntry | DocumentTyped) {
    if (entry instanceof DocumentTyped) {
      this.document = entry
      this.create = false
      return
    }

    if (!entry.suggested) {
      return
    }
    this.entry = entry
    this.document = entry.suggested
    this.create = false
  }

  createDocument(entry: DocumentEntry, type: string) {
    this.entry = entry
    this.document = new DocumentTyped()
    this.document.type = type
    this.document.value = {
      date: '',
      description: ''
    }
    this.create = true
  }

  saveDocument(document: DocumentTyped) {
    if (this.entry == null) {
      return
    }

    this.entry.suggested = document

    if (this.create) {
      this.importDataService.updateDocumentEntry(this.id, this.entry)
        .subscribe(() => this.load())
    } else {
      this.closeDocument()
    }
  }

  closeDocument() {
    this.entry = null
    this.document = null
    this.create = false
  }

  reCreate() {
    this.importDataService.reCreate(this.id)
      .subscribe(() => this.load())
  }

  save() {
    let nodes = this.asLinkList()
    if (nodes.length > 0) {
      this.performImport(nodes[0])
    }
  }

  private performImport(node: DocumentNode) {
    this.importDataService.performImport(node.entry.suggested)
      .subscribe(result => {
        node.entry.state = result.result ? 'success' : 'fail'
        if (node.next != null) {
          this.performImport(node.next)
        } else {
          this.load()
        }
      })
  }

  private asLinkList(): DocumentNode[] {
    let nodes = this.dateGroups.flatMap(dateGroup => dateGroup.entries)
      .filter(entry => entry.selected)
      .map(entry => {
        let node = new DocumentNode()
        node.entry = entry
        return node
      })

    for (let index = 0; index < nodes.length; index++) {
      let node = nodes[index]
      if (index < nodes.length - 1) {
        node.next = nodes[index + 1]
      }
    }
    return nodes
  }

  close() {
    this.router.navigate(['import-data']).then()
  }

  toggleSelection() {
    this.toggleSelectionState = !this.toggleSelectionState
    for (let dateGroup of this.dateGroups) {
      for (let entry of dateGroup.entries) {
        if (entry.suggested) {
          entry.state = 'none'
          entry.selected = this.toggleSelectionState
        }
      }
    }
  }

}

class DateGroup {
  date!: string
  entries: DateGroupEntry[] = []
}

class DateGroupEntry {
  id!: string
  selected: boolean = false
  state: 'none' | 'success' | 'fail' = 'none'
  source!: string
  suggested!: DocumentTyped
  existed!: DocumentTyped
}

class DocumentNode {
  entry!: DateGroupEntry
  next!: DocumentNode | null
}

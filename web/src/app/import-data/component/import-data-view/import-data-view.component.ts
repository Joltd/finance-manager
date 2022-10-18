import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ImportData, ImportDataEntry, ImportDataRelatedDocument} from "../../model/import-data";
import {ImportDataService} from "../../service/import-data.service";

@Component({
  selector: 'import-data-view',
  templateUrl: 'import-data-view.component.html',
  styleUrls: ['import-data-view.component.scss']
})
export class ImportDataViewComponent {

  private id!: string
  importData: ImportData = new ImportData()
  dateGroups: DateGroup[] = []

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

        for (let entry of result.entries) {
          let dateGroup = dateGroups.get(entry.date)
          if (!dateGroup) {
            dateGroup = new DateGroup()
            dateGroup.date = entry.date
            dateGroups.set(entry.date, dateGroup)
          }
          dateGroup.entries.push(entry)
        }

        for (let document of result.documents) {
          let dateGroup = dateGroups.get(document.date)
          if (!dateGroup) {
            dateGroup = new DateGroup()
            dateGroup.date = document.date
            dateGroups.set(document.date, dateGroup)
          }
          dateGroup.documents.push(document)
        }

        this.dateGroups = []
        for (let dateGroup of dateGroups.values()) {
          this.dateGroups.push(dateGroup)
        }
        this.dateGroups.sort((left,right) => left.date > right.date ? 1 : -1)
      })
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
  entries: ImportDataEntry[] = []
  documents: ImportDataRelatedDocument[] = []
}

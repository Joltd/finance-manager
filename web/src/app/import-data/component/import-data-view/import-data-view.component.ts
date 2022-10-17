import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ImportData} from "../../model/import-data";
import {ImportDataService} from "../../service/import-data.service";

@Component({
  selector: 'import-data-view',
  templateUrl: 'import-data-view.component.html',
  styleUrls: ['import-data-view.component.scss']
})
export class ImportDataViewComponent {

  private id!: string
  importData: ImportData = new ImportData()

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
      .subscribe(result => this.importData = result)
  }

  save() {
    let selected = this.importData.entries.filter(entry => entry.selected)
    if (selected.length == 0) {
      return
    }

    this.importDataService.performImport(this.importData.account, selected)
      .subscribe(() => this.load())
  }

  close() {
    this.router.navigate(['import-data']).then()
  }

}

import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ImportData, ImportDataEntry} from "../../model/import-data";
import {ImportDataService} from "../../service/import-data.service";
import {ShortMessageService} from "../../../common/service/short-message.service";

@Component({
  selector: 'import-data-view',
  templateUrl: 'import-data-view.component.html',
  styleUrls: ['import-data-view.component.scss']
})
export class ImportDataViewComponent {

  private id!: string
  importData!: ImportData

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private importDataService: ImportDataService,
    private shortMessageService: ShortMessageService
  ) {
    this.activatedRoute.params
      .subscribe(params => {
        this.id = params['id']
        this.load()
      })
  }

  private load() {
    this.importDataService.byId(this.id)
      .subscribe(result => this.importData = result)
  }

  openEntry(entry: ImportDataEntry) {
    this.router.navigate(['import-data', this.id, 'entry', entry.id]).then()
  }

  save() {
    this.importDataService.performImport(this.id)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['import-data']).then()
  }

}


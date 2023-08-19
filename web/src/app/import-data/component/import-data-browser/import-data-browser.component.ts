import {Component, OnDestroy, OnInit} from "@angular/core";
import {ImportDataService} from "../../service/import-data.service";
import {ImportData} from "../../model/import-data";
import {Router} from "@angular/router";

@Component({
  selector: 'import-data-browser',
  templateUrl: 'import-data-browser.component.html',
  styleUrls: ['import-data-browser.component.scss']
})
export class ImportDataBrowserComponent implements OnInit, OnDestroy {

  importData: ImportData[] = []
  private timerId!: any

  constructor(
    private importDataService: ImportDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load()

    this.timerId = setInterval(
      () => {
        if (this.importData.find(entry => this.isInProgress(entry))) {
          this.load()
        }
      },
      500
    )
  }

  ngOnDestroy(): void {
    clearInterval(this.timerId)
  }

  private load() {
    this.importDataService.list()
      .subscribe(result => this.importData = result)
  }

  start() {
    this.router.navigate(['import-data-start']).then()
  }

  cancel(importData: ImportData) {
    if (importData.status == 'PREPARE_IN_PROGRESS') {
      this.importDataService.cancelPreparation(importData.id)
        .subscribe(() => this.load())
    } else if (importData.status == 'IMPORT_IN_PROGRESS') {
      this.importDataService.cancelImport(importData.id)
        .subscribe(() => this.load())
    }
  }

  view(id: string) {
    this.router.navigate(['import-data', id]).then()
  }

  delete(id: string) {
    this.importDataService.delete(id)
      .subscribe(() => this.load())
  }

  isInProgress(importData: ImportData): boolean {
    return importData.status == 'PREPARE_IN_PROGRESS' || importData.status == 'IMPORT_IN_PROGRESS'
  }

  isDone(importData: ImportData): boolean {
    return importData.status == 'PREPARE_DONE' || importData.status == 'IMPORT_DONE'
  }

  deleteAllowed(importData: ImportData): boolean {
    return importData.status == 'NEW' || importData.status == 'FAILED' || this.isDone(importData)
  }

}

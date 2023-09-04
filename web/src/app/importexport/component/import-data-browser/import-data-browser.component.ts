import {Component, OnInit} from "@angular/core";
import {ImportDataService} from "../../service/import-data.service";
import {Router} from "@angular/router";
import {ImportData} from "../../model/import-data";

@Component({
  selector: "import-data-browser",
  templateUrl: "./import-data-browser.component.html",
  styleUrls: ["./import-data-browser.component.scss"]
})
export class ImportDataBrowserComponent implements OnInit {

  importDataList: ImportData[] = []

  constructor(
    private importDataService: ImportDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.importDataService.list()
      .subscribe(result => this.importDataList = result)
  }

  add() {
    this.router.navigate(['import-data-start']).then()
  }

  isEditAvailable(importData: ImportData): boolean {
    return importData.status != 'FAILED' && !this.isInProgress(importData)
  }

  edit(id: string) {
    this.router.navigate(['import-data', id]).then()
  }

  isInProgress(importData: ImportData): boolean {
    return importData.status == 'PREPARE_IN_PROGRESS' || importData.status == 'IMPORT_IN_PROGRESS'
  }

  cancel(importData: ImportData) {
    this.importDataService.cancel(importData)
      .subscribe(() => this.load())
  }

  isDeleteAvailable(importData: ImportData): boolean {
    return importData.status == 'NEW' || importData.status == 'FAILED' || this.isDone(importData)
  }

  delete(id: string) {
    this.importDataService.delete(id)
      .subscribe(() => this.load())
  }

  isDone(importData: ImportData): boolean {
    return importData.status == 'PREPARE_DONE' || importData.status == 'IMPORT_DONE'
  }

}

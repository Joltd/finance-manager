import {Component, OnInit} from "@angular/core";
import {ImportDataService} from "../../service/import-data.service";
import {ImportData} from "../../model/import-data";
import {Router} from "@angular/router";
import {ShortMessageService} from "../../../common/service/short-message.service";

@Component({
  selector: 'import-data-browser',
  templateUrl: 'import-data-browser.component.html',
  styleUrls: ['import-data-browser.component.scss']
})
export class ImportDataBrowserComponent implements OnInit {

  importData: ImportData[] = []

  constructor(
    private importDataService: ImportDataService,
    private router: Router,
    private shortMessageService: ShortMessageService
  ) {}

  ngOnInit(): void {
    this.load()
  }

  load() {
    this.importDataService.list()
      .subscribe(result => {
        this.importData = result
        this.checkProgress()
      })
  }

  edit(id: string) {
    this.router.navigate(['import-data', id])
      .then()
  }

  delete(id: string) {
    this.importDataService.delete(id)
      .subscribe(() => this.load())
  }

  instantImport(id: string) {
    this.importDataService.performImport(id)
      .subscribe(() => {
        this.shortMessageService.show("Import started")
        this.load()
      })
  }

  private checkProgress() {
    if (this.importData.find(entry => entry.progress > 0 && entry.progress < 1)) {
      setTimeout(() => {
        this.load()
      }, 1000)
    }
  }

}

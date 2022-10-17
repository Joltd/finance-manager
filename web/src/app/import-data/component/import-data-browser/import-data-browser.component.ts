import {Component, OnInit} from "@angular/core";
import {ImportDataService} from "../../service/import-data.service";
import {ImportData} from "../../model/import-data";
import {Router} from "@angular/router";

@Component({
  selector: 'import-data-browser',
  templateUrl: 'import-data-browser.component.html',
  styleUrls: ['import-data-browser.component.scss']
})
export class ImportDataBrowserComponent implements OnInit {

  importData: ImportData[] = []

  constructor(
    private importDataService: ImportDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load()
  }

  load() {
    this.importDataService.list()
      .subscribe(result => this.importData = result)
  }

  add() {
    this.router.navigate(['import-data', 'new'])
      .then()
  }

  edit(id: string) {
    this.router.navigate(['import-data', id])
      .then()
  }

  delete(id: string) {
    this.importDataService.delete(id)
      .subscribe(() => this.load())
  }

}

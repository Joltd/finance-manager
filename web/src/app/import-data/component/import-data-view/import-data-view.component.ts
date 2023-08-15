import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ImportData, ImportDataEntry, ImportDataEntryPage} from "../../model/import-data";
import {ImportDataService} from "../../service/import-data.service";
import {SettingsService} from "../../../settings/service/settings.service";
import {PageEvent} from "@angular/material/paginator";

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

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private importDataService: ImportDataService,
    private settingsService: SettingsService
  ) {
    this.settingsService.wideScreenToggle = false
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
    this.importDataService.entryList(this.id, this.page.page, this.page.size)
      .subscribe(result => this.page = result)
  }

  onPage(event: PageEvent) {
    this.page.page = event.pageIndex
    this.loadEntries()
  }

  viewEntry(entry: ImportDataEntry) {
    this.entry = entry
  }

  changeSuggestedDocument(entry: ImportDataEntry) {

  }

  save() {

  }

  close() {
    this.router.navigate(['import-data']).then()
  }

}


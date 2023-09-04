import {Component, OnDestroy, OnInit} from "@angular/core";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {ImportData, ImportDataEntry, ImportDataEntryPage} from "../../model/import-data";
import {FormControl, FormGroup} from "@angular/forms";
import {SettingsService} from "../../../settings/service/settings.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ImportDataService} from "../../service/import-data.service";
import {PageEvent} from "@angular/material/paginator";

@Component({
  selector: "import-data-view",
  templateUrl: "./import-data-view.component.html",
  styleUrls: ["./import-data-view.component.scss"]
})
export class ImportDataViewComponent implements OnInit, OnDestroy {

  id!: string
  importData!: ImportData
  importDataEntryPage: ImportDataEntryPage = {
    total: 0,
    page: 0,
    size: 20,
    entries: []
  }
  importDataEntry!: ImportDataEntry
  importDataEntryFilter = new FormGroup({
    preparationResult: new FormControl(null),
    option: new FormControl(null),
    importResult: new FormControl(null)
  })

  constructor(
    private settingsService: SettingsService,
    private toolbarService: ToolbarService,
    private activatedRoute: ActivatedRoute,
    private importDataService: ImportDataService,
    private router: Router
  ) {
    this.settingsService.wideScreenToggle = false
    this.activatedRoute.params.subscribe(params => {
      this.id = params['id']
      this.load()
    })
  }

  ngOnInit(): void {
    this.toolbarService.setup('Import', [

    ])
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
    this.settingsService.wideScreenToggle = true
  }

  private load() {
    this.importDataService.byId(this.id).subscribe(result => {
      this.importData = result
      this.entryLoad()
    })
  }

  private entryLoad() {
    let filter = {
      page: this.importDataEntryPage.page,
      size: this.importDataEntryPage.size,
      ...this.importDataEntryFilter.value
    }
    this.importDataService.entryList(this.id, filter)
      .subscribe(result => this.importDataEntryPage = result)
  }

  onPage(event: PageEvent) {
    this.importDataEntryPage.page = event.pageIndex
    this.entryLoad()
  }

  viewEntry(entry: ImportDataEntry) {
    this.importDataEntry = entry
  }

  close() {
    this.router.navigate(['import-data']).then()
  }

}

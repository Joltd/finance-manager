import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {ImportData, ImportDataEntry, ImportDataEntryPage, ImportOption} from "../../model/import-data";
import {FormControl, FormGroup} from "@angular/forms";
import {SettingsService} from "../../../settings/service/settings.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ImportDataService} from "../../service/import-data.service";
import {PageEvent} from "@angular/material/paginator";
import {Operation} from "../../../operation/model/operation";
import {CdkPortal} from "@angular/cdk/portal";
import {Overlay, OverlayConfig, OverlayRef} from "@angular/cdk/overlay";
import {MatDialog} from "@angular/material/dialog";
import {
  OperationEditorDialogComponent
} from "../../../operation/component/operation-editor-dialog/operation-editor-dialog.component";
import {
  CategoryMappingEditorDialogComponent
} from "../category-mapping-editor-dialog/category-mapping-editor-dialog.component";

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
    private router: Router,
    private dialog: MatDialog
  ) {
    this.settingsService.wideScreenToggle = false
    this.activatedRoute.params.subscribe(params => {
      this.id = params['id']
      this.load()
    })
  }

  ngOnInit(): void {
    this.toolbarService.setup('Import', [
      { name: 'repeatPreparation', icon: '', action: () => this.repeatPreparation() }
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

  viewOperation() {
    this.dialog.open(OperationEditorDialogComponent, {
      data: this.importDataEntry.suggestedOperation
    }).afterClosed().subscribe(result => {
      if (result) {
        this.importDataEntry.suggestedOperation = result
      }
    })
  }

  changeOption(option: ImportOption) {
    this.importDataEntry.option = option
  }

  suggestedOperation(): Operation {
    return this.importDataEntry.suggestedOperation as Operation
  }

  addCategoryMapping() {
    this.dialog.open(CategoryMappingEditorDialogComponent, {
      width: '30rem',
      data: {
        parser: this.importData.parser,
        pattern: this.importDataEntry.parsedEntry.description
      }
    }).afterClosed().subscribe(result => {

    })
  }

  private repeatPreparation() {

  }

}

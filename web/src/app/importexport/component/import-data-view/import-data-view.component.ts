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
import {CategoryMappingService} from "../../service/category-mapping.service";
import {ShortMessageService} from "../../../common/service/short-message.service";

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
    operationType: new FormControl(null),
    preparationResult: new FormControl(null),
    option: new FormControl(null),
    importResult: new FormControl(null)
  })
  tabIndex: number = 0

  constructor(
    private settingsService: SettingsService,
    private toolbarService: ToolbarService,
    private activatedRoute: ActivatedRoute,
    private importDataService: ImportDataService,
    private categoryMappingService: CategoryMappingService,
    private shortMessageService: ShortMessageService,
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
      { name: 'repeatPreparation', icon: 'carpenter', action: () => this.repeatPreparation() },
      { name: 'startImport', icon: 'publish', action: () => this.startImport() },
      { name: 'close', icon: 'close', action: () => this.close() }
    ])
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
    this.settingsService.wideScreenToggle = true
  }

  private load() {
    this.importDataService.byId(this.id).subscribe(result => {
      this.importData = result
      this.toolbarService.setupTitle(`Import - ${this.importData.parser.name} (${this.importData.account.name})`)
      this.entryLoad()
    })
  }

  entryLoad() {
    let filter = {
      page: this.importDataEntryPage.page,
      size: this.importDataEntryPage.size,
      ...this.importDataEntryFilter.value
    }
    this.importDataService.entryList(this.id, filter)
      .subscribe(result => this.importDataEntryPage = result)
  }

  private entryById() {
    this.importDataService.byIdEntry(this.id, this.importDataEntry.id)
      .subscribe(result => this.importDataEntry = result)
  }

  updatePreparationResult(preparationResult: boolean) {
    this.importDataService.entryUpdate(this.importData.id, this.importDataEntry.id, {preparationResult})
      .subscribe(() => {
        this.entryLoad()
        this.entryById()
      })
  }

  updateOption(option: ImportOption) {
    this.importDataService.entryUpdate(this.importData.id, this.importDataEntry.id, {option})
      .subscribe(() => {
        this.entryLoad()
        this.entryById()
      })
  }

  onPage(event: PageEvent) {
    this.importDataEntryPage.page = event.pageIndex
    this.entryLoad()
  }

  filter() {
    this.tabIndex = 0
    this.entryLoad()
  }

  searchSimilar() {
    this.importDataService.entryUpdateSimilar(this.importData.id, this.importDataEntry.id)
      .subscribe(() => this.entryById())
  }

  viewEntry(entry: ImportDataEntry) {
    this.importDataEntry = entry
  }

  close() {
    this.router.navigate(['import-data']).then()
  }

  viewOperation() {
    if (this.importDataEntry.importResult == 'DONE') {
      return
    }
    this.dialog.open(OperationEditorDialogComponent, {
      data: this.importDataEntry.suggestedOperation
    }).afterClosed().subscribe(result => {
      if (result) {
        this.importDataService.entryUpdate(this.importData.id, this.importDataEntry.id, {suggestedOperation: result})
      }
    })
  }

  suggestedOperation(): Operation {
    return this.importDataEntry.suggestedOperation as Operation
  }

  isInProgress(): boolean {
    return this.importData.status == 'PREPARE_IN_PROGRESS' || this.importData.status == 'IMPORT_IN_PROGRESS'
  }

  addCategoryMapping() {
    this.dialog.open(CategoryMappingEditorDialogComponent, {
      width: '30rem',
      data: {
        parser: this.importData.parser,
        pattern: this.importDataEntry.parsedEntry.description
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.categoryMappingService.update(result)
          .subscribe(() => {})
      }
    })
  }

  private repeatPreparation() {
    if (this.isInProgress()) {
      this.shortMessageService.show('Already in progress')
      return
    }
    this.importDataService.preparationRepeat(this.importData.id, null)
      .subscribe(() => {
        this.importData.status = 'PREPARE_IN_PROGRESS'
        this.shortMessageService.show('Preparation started')
      })
  }

  repeatPreparationEntry() {
    this.importDataService.preparationRepeat(this.importData.id, this.importDataEntry.id)
      .subscribe(() => {
        this.entryLoad()
        this.entryById()
      })
  }

  private startImport() {
    if (this.isInProgress()) {
      this.shortMessageService.show('Already in progress')
      return
    }
    this.importDataService.importStart(this.importData.id)
      .subscribe(() => {
        this.importData.status = 'IMPORT_IN_PROGRESS'
        this.shortMessageService.show('Import started')
      })
  }

}

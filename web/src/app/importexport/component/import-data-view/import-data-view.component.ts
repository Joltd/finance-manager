import {ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {ImportData, ImportDataEntry, ImportDataEntryPage, ImportOption} from "../../model/import-data";
import {FormControl, FormGroup} from "@angular/forms";
import {SettingsService} from "../../../settings/service/settings.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ImportDataService} from "../../service/import-data.service";
import {PageEvent} from "@angular/material/paginator";
import {Operation} from "../../../operation/model/operation";
import {MatDialog} from "@angular/material/dialog";
import {
  OperationEditorDialogComponent
} from "../../../operation/component/operation-editor-dialog/operation-editor-dialog.component";
import {
  CategoryMappingEditorDialogComponent
} from "../category-mapping-editor-dialog/category-mapping-editor-dialog.component";
import {CategoryMappingService} from "../../service/category-mapping.service";
import {ShortMessageService} from "../../../common/service/short-message.service";
import {Subscription} from "rxjs";
import {OperationService} from "../../../operation/service/operation.service";

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
    hideSkip: new FormControl(false),
    importResult: new FormControl(null)
  })
  tabIndex: number = 0
  private subscription!: Subscription

  constructor(
    private settingsService: SettingsService,
    private toolbarService: ToolbarService,
    private activatedRoute: ActivatedRoute,
    private importDataService: ImportDataService,
    private categoryMappingService: CategoryMappingService,
    private shortMessageService: ShortMessageService,
    private router: Router,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private operationService: OperationService
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
    this.subscription?.unsubscribe()
    this.toolbarService.reset()
    this.settingsService.wideScreenToggle = true
  }

  private load() {
    this.importDataService.byId(this.id).subscribe(result => {
      this.importData = result
      this.toolbarService.setupTitle(`Import - ${this.importData.parser.name} (${this.importData.account.name})`)
      this.entryLoad()
      if (this.isInProgress() || this.importData.status == 'NEW') {
        this.updateImportDataState()
      }
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

  private entryLoadAndById() {
    let filter = {
      page: this.importDataEntryPage.page,
      size: this.importDataEntryPage.size,
      ...this.importDataEntryFilter.value
    }
    this.importDataService.entryList(this.id, filter)
      .subscribe(result => {
        this.importDataEntryPage = result
        if (!this.importDataEntry?.id) {
          return
        }

        let updateImportDataEntry = this.importDataEntryPage
          .entries
          .find(entry => entry.id == this.importDataEntry.id)
        if (updateImportDataEntry) {
          this.importDataEntry = null as any
          setTimeout(() => {
            this.importDataEntry = updateImportDataEntry as any
          })
          return
        }

        if (this.importDataEntryPage.entries.length > 0) {
          this.importDataEntry = null as any
          setTimeout(() => {
            this.importDataEntry = this.importDataEntryPage.entries[0]
          })
        }
      })
  }

  updatePreparationResult(preparationResult: boolean) {
    this.importDataService.entryUpdate(this.importData.id, this.importDataEntry.id, {preparationResult})
      .subscribe(() => this.entryLoadAndById())
  }

  updateOption(option: ImportOption) {
    this.importDataService.entryUpdate(this.importData.id, this.importDataEntry.id, {option})
      .subscribe(() => this.entryLoadAndById())
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
    let suggestedOperation = this.importDataEntry.suggestedOperation
    if (!suggestedOperation) {
      suggestedOperation = {
        date: this.importDataEntry.parsedEntry.date,
        type: this.importDataEntry.parsedEntry.type,
        accountFrom: this.importDataEntry.parsedEntry.type == 'EXPENSE' ? this.importData.account : null,
        amountFrom: this.importDataEntry.parsedEntry.amountFrom,
        accountTo: this.importDataEntry.parsedEntry.type == 'INCOME' ? this.importData.account : null,
        amountTo: this.importDataEntry.parsedEntry.amountTo,
        description: this.importDataEntry.parsedEntry.description,
      } as any
    }
    this.dialog.open(OperationEditorDialogComponent, {
      data: suggestedOperation
    }).afterClosed().subscribe(result => {
      if (result) {
        this.importDataService.entryUpdate(this.importData.id, this.importDataEntry.id, { suggestedOperation: result })
          .subscribe(() => this.entryLoadAndById())
      }
    })
  }

  suggestedOperation(): Operation {
    return this.importDataEntry.suggestedOperation as Operation
  }

  isInProgress(): boolean {
    return this.importData.status == 'PREPARE_IN_PROGRESS' || this.importData.status == 'IMPORT_IN_PROGRESS'
  }

  editSimilarOperation(operation: Operation) {
    this.dialog.open(OperationEditorDialogComponent, {
      data: operation
    }).afterClosed().subscribe(result => {
      if (result) {
        this.operationService.update(result)
          .subscribe(() => this.entryLoadAndById())
      }
    })
  }

  deleteSimilarOperation(operation: Operation) {
    this.operationService.delete(operation.id!)
      .subscribe(() => this.searchSimilar())
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

  deleteCategoryMapping(id: string | null) {
    this.importDataEntry.matchedCategoryMappings = this.importDataEntry
      .matchedCategoryMappings
      .filter(mapping => mapping.id != id)
    this.categoryMappingService.delete(id!!).subscribe()
  }

  private repeatPreparation() {
    if (this.isInProgress()) {
      this.shortMessageService.show('Already in progress')
      return
    }
    this.importDataService.preparationRepeat(this.importData.id)
      .subscribe(() => {
        this.importData.status = 'PREPARE_IN_PROGRESS'
        this.shortMessageService.show('Preparation started')
        this.updateImportDataState()
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
        this.updateImportDataState()
      })
  }

  progress(): number {
    let progress = this.importData?.progress || 0;
    return progress >= 1 ? 0 : progress * 100
  }

  private updateImportDataState() {
    this.subscription = this.importDataService.importDataState()
      .subscribe(result => {
        this.importData.status = result.status
        this.importData.progress = result.progress
        this.changeDetectorRef.detectChanges()
      })
  }

}

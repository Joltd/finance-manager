import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {MatExpansionPanel} from "@angular/material/expansion";
import {FormControl, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {SettingsService} from "../../../settings/service/settings.service";
import {OperationReviseService} from "../../service/operation-revise.service";
import {OperationRevise, OperationReviseEntry} from "../../model/operation-revise";
import {Operation} from "../../../operation/model/operation";
import {MatDialog} from "@angular/material/dialog";
import {
  OperationEditorDialogComponent
} from "../../../operation/component/operation-editor-dialog/operation-editor-dialog.component";
import {OperationService} from "../../../operation/service/operation.service";
import {
  ImportDataParsedEntryDialogComponent
} from "../import-data-parsed-entry-dialog/import-data-parsed-entry-dialog.component";

@Component({
  selector: 'operation-revise-view',
  templateUrl: './operation-revise-view.component.html',
  styleUrls: ['./operation-revise-view.component.scss']
})
export class OperationReviseViewComponent implements OnInit,OnDestroy {

  @ViewChild(MatExpansionPanel)
  settingsPanel!: MatExpansionPanel

  form: FormGroup = new FormGroup({
    dateFrom: new FormControl(null),
    dateTo: new FormControl(null),
    currency: new FormControl(null),
    account: new FormControl(null),
    parser: new FormControl(null),
    file: new FormControl(null)
  })

  id!: string
  operationRevise!: OperationRevise
  hideMatched: boolean = false
  date: string | null = null
  entries: OperationReviseEntry[] = []

  constructor(
    private settingsService: SettingsService,
    private toolbarService: ToolbarService,
    private operationReviseService: OperationReviseService,
    private operationService: OperationService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if (id != 'new') {
        this.id = id
        setTimeout(() => this.settingsService.wideScreenToggle = false)
        this.load()
      }

      if (this.id) {
        this.toolbarService.setup('Operation Revise', [
          { name: 'revise', icon: 'difference', action: () => this.repeatRevise() },
          { name: 'close', icon: 'close', action: () => this.close() }
        ])
      } else {
        this.toolbarService.setupSaveClose(
          'Operation Revise',
          () => this.save(),
          () => this.close())
      }
    })
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
    this.settingsService.wideScreenToggle = true
  }

  private load() {
    this.operationReviseService.byId(this.id)
      .subscribe(result => this.operationRevise = result)
  }

  private entryLoad() {
    let filter = {
      date: this.date,
      hideMatched: this.hideMatched
    }
    this.operationReviseService.entryList(this.operationRevise.id!, filter)
      .subscribe(result => this.entries = result)
  }

  private save() {
    let record = {
      id: null,
      dateFrom: this.form.value.dateFrom,
      dateTo: this.form.value.dateTo,
      currency: this.form.value.currency,
      account: this.form.value.account,
      parser: this.form.value.parser,
      dates: []
    }
    this.operationReviseService.newRevise(record, this.form.value.file)
      .subscribe(() => this.close())
  }

  private close() {
    this.router.navigate(['operation-revise']).then()
  }

  selectDate(date: string) {
    this.date = date
    this.toolbarService.setupTitle('Operation Revise - ' + date)
    this.entryLoad()
  }

  toggleHideMatched() {
    this.hideMatched = !this.hideMatched
    this.entryLoad()
  }

  viewParsedEntry(operationReviseEntry: OperationReviseEntry) {
    if (operationReviseEntry.parsedEntry != null) {
      this.dialog.open(ImportDataParsedEntryDialogComponent, {data: operationReviseEntry.parsedEntry})
    }
  }

  addOperation() {
    let operation = {
      date: this.date,
      type: 'EXCHANGE',
      description: '',
    } as any
    this.editOperation(operation)
  }

  editOperation(operation: Operation | null) {
    this.dialog.open(OperationEditorDialogComponent, {
      data: operation
    }).afterClosed()
      .subscribe(result => {
        if (result) {
          this.operationService.update(result)
            .subscribe(() => this.repeatRevise())
        }
      })
  }

  deleteOperation(entry: OperationReviseEntry) {
    if (entry.operation != null) {
      this.operationService.delete(entry.operation.id!)
        .subscribe(() => this.repeatRevise())
    }
  }

  private repeatRevise() {
    this.operationReviseService.repeatRevise(this.id)
      .subscribe(() => {
        this.load()
        this.entryLoad()
      })
  }

}

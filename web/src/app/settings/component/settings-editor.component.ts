import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import {SettingsService} from "../service/settings.service";
import {FormControl, FormGroup} from "@angular/forms";
import {Settings} from "../model/settings";
import {ShortMessageService} from "../../common/service/short-message.service";
import {ToolbarService} from "../../common/service/toolbar.service";
import { CommonLayoutComponent } from "../../common/component/common-layout/common-layout.component";

@Component({
  selector: 'settings-editor',
  templateUrl: 'settings-editor.component.html',
  styleUrls: ['settings-editor.component.scss']
})
export class SettingsEditorComponent implements OnInit,OnDestroy {

  form: FormGroup = new FormGroup({
    operationDefaultCurrency: new FormControl(null),
    operationDefaultAccount: new FormControl(null),
    operationCashAccount: new FormControl(null)
  })

  constructor(
    public settingsService: SettingsService,
    private shortMessageService: ShortMessageService,
    private toolbarService: ToolbarService
  ) {}

  ngOnInit(): void {
    this.toolbarService.setup(
      'Settings',
      [{ name: 'save', icon: 'done', action: () => this.save() }]
    )
    this.load()
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
  }

  private load() {
    this.settingsService.load()
      .subscribe(settings => this.form.patchValue(settings))
  }

  save() {
    if (this.form.invalid) {
      return
    }
    this.settingsService.update(this.form.value)
      .subscribe(() => {
        this.shortMessageService.show("Done")
        this.load()
      })
  }

}

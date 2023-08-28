import {Component, OnDestroy, OnInit} from "@angular/core";
import {SettingsService} from "../service/settings.service";
import {FormControl, FormGroup} from "@angular/forms";
import {Settings} from "../model/settings";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {ShortMessageService} from "../../common/service/short-message.service";
import {ToolbarService} from "../../common/service/toolbar.service";

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
    this.form.patchValue(this.settingsService.settings)
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
  }

  save() {
    if (this.form.valid) {
      return
    }
    this.settingsService.update(this.form.value)
      .subscribe(() => this.shortMessageService.show("Done"))
  }

}

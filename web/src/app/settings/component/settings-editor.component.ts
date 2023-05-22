import {Component, OnInit} from "@angular/core";
import {SettingsService} from "../service/settings.service";
import {FormControl, FormGroup} from "@angular/forms";
import {Settings} from "../model/settings";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {ShortMessageService} from "../../common/service/short-message.service";

@Component({
  selector: 'settings-editor',
  templateUrl: 'settings-editor.component.html',
  styleUrls: ['settings-editor.component.scss']
})
export class SettingsEditorComponent implements OnInit {

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  currencies: string[] = []
  fastExpense: FormGroup = new FormGroup({
    account: new FormControl(null),
    currency: new FormControl(null)
  })

  constructor(
    public settingsService: SettingsService,
    private shortMessageService: ShortMessageService
  ) {}

  ngOnInit(): void {
    this.load()
  }

  valid(): boolean {
    return this.fastExpense.valid && this.currencies.length > 0
  }

  load() {
    this.settingsService.load()
      .subscribe(result => {
        this.currencies = result.currencies
        this.fastExpense.patchValue(result.fastExpense)
      })
  }

  save() {
    let settings = new Settings()
    settings.currencies = this.currencies
    settings.fastExpense = this.fastExpense.value
    this.settingsService.update(settings)
      .subscribe(() => {
        this.shortMessageService.show("Done")
        this.load()
      })
  }

  clearDatabase() {
    this.settingsService.clearDatabase()
      .subscribe(() => {
        this.shortMessageService.show("Done")
        this.load()
      })
  }

  handleDocuments() {
    this.settingsService.handleDocuments()
      .subscribe(() => this.shortMessageService.show("Done"))
  }

  addCurrency(event: MatChipInputEvent) {
    let value = (event.value || '').trim();

    if (value) {
      this.currencies.push(value);
    }

    event.chipInput!.clear();
  }

  removeCurrency(currency: string) {
    let index = this.currencies.indexOf(currency);

    if (index >= 0) {
      this.currencies.splice(index, 1);
    }
  }

}

import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ExchangeRateService} from "../../service/exchange-rate.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SettingsService} from "../../../settings/service/settings.service";

@Component({
  selector: 'exchange-rate-editor',
  templateUrl: 'exchange-rate-editor.component.html',
  styleUrls: ['exchange-rate-editor.component.scss']
})
export class ExchangeRateEditorComponent {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    date: new FormControl(null, Validators.required),
    from: new FormControl(null, Validators.required),
    to: new FormControl(null, Validators.required),
    value: new FormControl(null, Validators.required)
  })

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private exchangeRateService: ExchangeRateService,
    public settingsService: SettingsService
  ) {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if (id != 'new') {
        this.form.patchValue({id})
        this.load()
      }
    })
  }

  private load() {
    this.exchangeRateService.byId(this.form.value.id)
      .subscribe(result => {
        this.form.patchValue(result)
      })
  }

  save() {
    this.exchangeRateService.update(this.form.value)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['exchange-rate']).then()
  }

}

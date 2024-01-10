import {Component, OnDestroy, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CurrencyService} from "../../service/currency.service";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'currency-editor',
  templateUrl: 'currency-editor.component.html',
  styleUrls: ['currency-editor.component.scss']
})
export class CurrencyEditorComponent {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl(null, Validators.required),
    crypto: new FormControl(false),
    style: new FormControl(null),
  })

  constructor(
    private currencyService: CurrencyService,
    private toolbarService: ToolbarService,
    private activatedRoute: ActivatedRoute,
    private router: Router
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
    this.currencyService.byId(this.form.value.id)
      .subscribe(result => {
        this.form.patchValue(result)
      })
  }

  save() {
    this.currencyService.update(this.form.value)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['currency']).then()
  }

}

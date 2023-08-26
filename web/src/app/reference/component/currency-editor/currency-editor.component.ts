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
export class CurrencyEditorComponent implements OnInit,OnDestroy {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl(null, Validators.required),
    crypto: new FormControl(false)
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

  ngOnInit(): void {
    this.toolbarService.setup("Currency", [
      { name: 'done', icon: 'done', action: () => this.save() },
      { name: 'close', icon: 'close', action: () => this.close() },
    ])
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
  }

  private load() {
    this.currencyService.byId(this.form.value.id)
      .subscribe(result => {
        this.form.patchValue(result)
      })
  }

  private save() {
    this.currencyService.update(this.form.value)
      .subscribe(() => this.close())
  }

  private close() {
    this.router.navigate(['currency']).then()
  }

}

import {Component, OnDestroy, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService} from "../../service/account.service";
import {ToolbarService} from "../../../common/service/toolbar.service";

@Component({
  selector: 'account-editor',
  templateUrl: 'account-editor.component.html',
  styleUrls: ['account-editor.component.scss']
})
export class AccountEditorComponent {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    type: new FormControl(null, Validators.required),
    name: new FormControl(null, Validators.required),
    deleted: new FormControl(false),
    reviseDate: new FormControl(null),
  })

  constructor(
    private accountService: AccountService,
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
    this.accountService.byId(this.form.value.id)
      .subscribe(result => {
        this.form.patchValue(result)
      })
  }

  save() {
    if (this.form.invalid) {
      return
    }
    this.accountService.update(this.form.value)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['account']).then()
  }

}

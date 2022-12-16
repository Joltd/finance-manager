import {Component} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {IncomeCategoryService} from "../../service/income-category.service";

@Component({
  selector: 'income-category-editor',
  templateUrl: 'income-category-editor.component.html',
  styleUrls: ['income-category-editor.component.scss']
})
export class IncomeCategoryEditorComponent {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl(null, Validators.required)
  })

  constructor(
    private incomeCategoryService: IncomeCategoryService,
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
    this.incomeCategoryService.bytId(this.form.value.id)
      .subscribe(result => this.form.patchValue(result))
  }

  save() {
    this.incomeCategoryService.update(this.form.value)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['income']).then()
  }

}

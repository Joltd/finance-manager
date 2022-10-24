import {Component} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {IncomeCategoryService} from "../../service/income-category.service";
import {IncomeCategory} from "../../module/income-category";

@Component({
  selector: 'income-category-editor',
  templateUrl: 'income-category-editor.component.html',
  styleUrls: ['income-category-editor.component.scss']
})
export class IncomeCategoryEditorComponent {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl(null, Validators.required),
    patterns: new FormControl(null)
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
      .subscribe(result => {
        this.form.patchValue({
          name: result.name,
          patterns: result.patterns.join('\n')
        })
      })
  }

  save() {
    let incomeCategory = new IncomeCategory()
    incomeCategory.id = this.form.value.id
    incomeCategory.name = this.form.value.name
    incomeCategory.patterns = this.form.value.patterns?.split('\n') || []
    this.incomeCategoryService.update(incomeCategory)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['income']).then()
  }

}

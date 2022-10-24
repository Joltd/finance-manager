import {Component} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ExpenseCategoryService} from "../../service/expense-category.service";
import {ExpenseCategory} from "../../module/expense-category";

@Component({
  selector: 'expense-category-editor',
  templateUrl: 'expense-category-editor.component.html',
  styleUrls: ['expense-category-editor.component.scss']
})
export class ExpenseCategoryEditorComponent {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl(null, Validators.required),
    patterns: new FormControl(null)
  })

  constructor(
    private expenseCategoryService: ExpenseCategoryService,
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
    this.expenseCategoryService.bytId(this.form.value.id)
      .subscribe(result => {
        this.form.patchValue({
          name: result.name,
          patterns: result.patterns.join('\n')
        })
      })
  }

  save() {
    let expenseCategory = new ExpenseCategory()
    expenseCategory.id = this.form.value.id
    expenseCategory.name = this.form.value.name
    expenseCategory.patterns = this.form.value.patterns?.split('\n') || []
    this.expenseCategoryService.update(expenseCategory)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['expense']).then()
  }

}

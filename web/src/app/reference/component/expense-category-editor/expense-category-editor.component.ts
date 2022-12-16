import {Component} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ExpenseCategoryService} from "../../service/expense-category.service";

@Component({
  selector: 'expense-category-editor',
  templateUrl: 'expense-category-editor.component.html',
  styleUrls: ['expense-category-editor.component.scss']
})
export class ExpenseCategoryEditorComponent {

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl(null, Validators.required)
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
        this.form.patchValue(result)
      })
  }

  save() {
    this.expenseCategoryService.update(this.form.value)
      .subscribe(() => this.close())
  }

  close() {
    this.router.navigate(['expense']).then()
  }

}

import {Component, OnInit} from "@angular/core";
import {ExpenseCategoryService} from "../../service/expense-category.service";
import {Router} from "@angular/router";
import {ExpenseCategory} from "../../module/expense-category";

@Component({
  selector: 'expense-category-browser',
  templateUrl: 'expense-category-browser.component.html',
  styleUrls: ['expense-category-browser.component.scss']
})
export class ExpenseCategoryBrowserComponent implements OnInit {

  expenseCategories: ExpenseCategory[] = []

  constructor(
    private expenseCategoryService: ExpenseCategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.expenseCategoryService.list()
      .subscribe(result => this.expenseCategories = result.sort((left,right) => left > right ? -1 : 1))
  }

  add() {
    this.router.navigate(['expense', 'new']).then()
  }

  edit(id: string) {
    this.router.navigate(['expense', id]).then()
  }

  delete(id: string) {
    this.expenseCategoryService.delete(id)
      .subscribe(() => this.load())
  }

}

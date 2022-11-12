import {Component, OnInit} from "@angular/core";
import {ExpenseCategoryService} from "../../service/expense-category.service";
import {Router} from "@angular/router";
import {ExpenseCategory} from "../../model/expense-category";
import {ShortMessageService} from "../../../common/service/short-message.service";

@Component({
  selector: 'expense-category-browser',
  templateUrl: 'expense-category-browser.component.html',
  styleUrls: ['expense-category-browser.component.scss']
})
export class ExpenseCategoryBrowserComponent implements OnInit {

  expenseCategories: ExpenseCategory[] = []

  constructor(
    private expenseCategoryService: ExpenseCategoryService,
    private router: Router,
    private shortMessageService: ShortMessageService
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.expenseCategoryService.list()
      .subscribe(result => this.expenseCategories = result.sort((left,right) => left.name > right.name ? 1 : -1))
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

  usage(id: string) {
    this.expenseCategoryService.usage(id)
      .subscribe(result => this.shortMessageService.show(`Used in ${result.value}`))
  }

}

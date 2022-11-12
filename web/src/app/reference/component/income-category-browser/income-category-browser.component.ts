import {Component, OnInit} from "@angular/core";
import {IncomeCategoryService} from "../../service/income-category.service";
import {Router} from "@angular/router";
import {IncomeCategory} from "../../model/income-category";
import {ShortMessageService} from "../../../common/service/short-message.service";

@Component({
  selector: 'income-category-browser',
  templateUrl: 'income-category-browser.component.html',
  styleUrls: ['income-category-browser.component.scss']
})
export class IncomeCategoryBrowserComponent implements OnInit {

  incomeCategories: IncomeCategory[] = []

  constructor(
    private incomeCategoryService: IncomeCategoryService,
    private router: Router,
    private shortMessageService: ShortMessageService
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.incomeCategoryService.list()
      .subscribe(result => this.incomeCategories = result.sort((left,right) => left.name > right.name ? 1 : -1))
  }

  add() {
    this.router.navigate(['income', 'new']).then()
  }

  edit(id: string) {
    this.router.navigate(['income', id]).then()
  }

  delete(id: string) {
    this.incomeCategoryService.delete(id)
      .subscribe(() => this.load())
  }

  usage(id: string) {
    this.incomeCategoryService.usage(id)
      .subscribe(result => this.shortMessageService.show(`Used in ${result.value}`))
  }

}

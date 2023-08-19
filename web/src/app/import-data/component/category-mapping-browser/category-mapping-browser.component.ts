import {Component, ViewChild} from "@angular/core";
import {MatExpansionPanel} from "@angular/material/expansion";
import {FormControl, FormGroup} from "@angular/forms";
import {CategoryMappingPage} from "../../model/category-mapping";
import {PageEvent} from "@angular/material/paginator";
import {CategoryMappingService} from "../../service/category-mapping.service";
import {Reference} from "../../../common/model/reference";
import {ReferenceService} from "../../../common/service/reference.service";
import {Router} from "@angular/router";

@Component({
  selector: 'category-mapping-browser',
  templateUrl: './category-mapping-browser.component.html',
  styleUrls: ['./category-mapping-browser.component.scss']
})
export class CategoryMappingBrowserComponent {

  @ViewChild('filter')
  filter!: MatExpansionPanel
  settings: FormGroup = new FormGroup({
    parser: new FormControl(null),
    category: new FormControl(null),
  })
  categoryMappingPage: CategoryMappingPage = new CategoryMappingPage()

  expenseCategories: Reference[] = []
  incomeCategories: Reference[] = []

  constructor(
    private router: Router,
    private categoryMappingService: CategoryMappingService,
    private referenceService: ReferenceService
  ) {
    this.referenceService.list('/expense/reference')
      .subscribe(result => {
        this.expenseCategories = result
        this.referenceService.list('/income/reference')
          .subscribe(result => {
            this.incomeCategories = result
          })
      })
  }

  load() {
    this.filter.close()
    let filter = {...this.settings.value}
    filter.page = this.categoryMappingPage.page
    filter.size = this.categoryMappingPage.size
    this.categoryMappingService.list(filter)
      .subscribe(result => this.categoryMappingPage = result)
  }

  onPage(event: PageEvent) {
    this.categoryMappingPage.page = event.pageIndex
    this.load()
  }

  add() {
    this.router.navigate(['category-mapping', 'new']).then()
  }

  edit(id: string) {
    this.router.navigate(['category-mapping', id]).then()
  }

  delete(id: string) {
    this.categoryMappingService.delete(id)
      .subscribe(() => this.load())
  }

}

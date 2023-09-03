import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatExpansionPanel} from "@angular/material/expansion";
import {FormControl, FormGroup} from "@angular/forms";
import {CategoryMappingPage} from "../../model/category-mapping";
import {CategoryMappingService} from "../../service/category-mapping.service";
import {Router} from "@angular/router";
import {PageEvent} from "@angular/material/paginator";
import {ToolbarService} from "../../../common/service/toolbar.service";

@Component({
  selector: 'category-mapping-browser',
  templateUrl: './category-mapping-browser.component.html',
  styleUrls: ['./category-mapping-browser.component.scss']
})
export class CategoryMappingBrowserComponent implements OnInit, OnDestroy {

  @ViewChild(MatExpansionPanel)
  filter!: MatExpansionPanel
  settings: FormGroup = new FormGroup({
    parser: new FormControl(null),
    category: new FormControl(null),
  })
  categoryMappingPage: CategoryMappingPage = {
    total: 0,
    page: 0,
    size: 20,
    mappings: []
  }

  constructor(
    private categoryMappingService: CategoryMappingService,
    private router: Router,
    private toolbarService: ToolbarService,
  ) {}

  ngOnInit(): void {
    this.toolbarService.setup('Category Mapping', [
      {
        name: 'load',
        icon: 'done',
        action: () => {
          this.filter.close()
          this.load()
        }
      }
    ])
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
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

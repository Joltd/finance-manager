import {AfterViewInit, Component, ViewChild} from "@angular/core";
import {DocumentService} from "../../service/document.service";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {PageEvent} from "@angular/material/paginator";
import {DocumentPage} from "../../model/document-page";
import {Reference} from "../../../common/model/reference";
import {ReferenceService} from "../../../common/service/reference.service";
import {MatExpansionPanel} from "@angular/material/expansion";

@Component({
  selector: 'document-browser',
  templateUrl: 'document-browser.component.html',
  styleUrls: ['document-browser.component.scss']
})
export class DocumentBrowserComponent implements AfterViewInit {

  @ViewChild('filter')
  filter!: MatExpansionPanel

  types: Reference[] = []

  expenseCategories: Reference[] = []
  incomeCategories: Reference[] = []

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private referenceService: ReferenceService
  ) {
    this.referenceService.list('/expense/reference')
      .subscribe(result => {
        this.expenseCategories = result
        this.referenceService.list('/income/reference')
          .subscribe(result => {
            this.incomeCategories = result
            if (this.settings().value.categories.length == 0) {
              this.selectAllCategories()
            }
          })
      })

  }

  ngAfterViewInit(): void {
    this.load()
  }

  documentPage(): DocumentPage {
    return this.documentService.documentPage
  }

  settings(): FormGroup {
    return this.documentService.settings
  }

  toggleAllCategories() {
    if (this.settings().value.categories.length == 0) {
      this.selectAllCategories()
    } else {
      this.settings().patchValue({
        categories: []
      })
    }
  }

  private selectAllCategories() {
    this.settings().patchValue({
      categories: this.expenseCategories.map(category => category.id).concat(
        this.incomeCategories.map(category => category.id)
      )
    })
  }

  onPage(event: PageEvent) {
    this.documentService.documentPage.page = event.pageIndex
    this.load()
  }

  load() {
    this.filter.close()
    this.documentService.list()
  }

  add(type: string) {
    this.router.navigate(['document', type]).then()
  }

  edit(id: string) {
    this.router.navigate(['document', id]).then()
  }

  copy(id: string) {
    this.router.navigate(
      ['document', id],
      {queryParams: {copy: true}}
    ).then()
  }

  delete(id: string) {
    this.documentService.delete(id).subscribe(() => this.load())
  }

}

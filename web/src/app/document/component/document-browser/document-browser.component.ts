import {Component, OnInit} from "@angular/core";
import {DocumentService} from "../../service/document.service";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {PageEvent} from "@angular/material/paginator";
import {DocumentPage} from "../../model/document-page";
import {Reference} from "../../../common/model/reference";
import {ReferenceService} from "../../../common/service/reference.service";

@Component({
  selector: 'document-browser',
  templateUrl: 'document-browser.component.html',
  styleUrls: ['document-browser.component.scss']
})
export class DocumentBrowserComponent implements OnInit {

  types: Reference[] = [
    new Reference('expense', 'Expense'),
    new Reference('income', 'Income'),
    new Reference('exchange', 'Exchange')
  ]

  expenseCategories: Reference[] = []
  incomeCategories: Reference[] = []

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private referenceService: ReferenceService
  ) {
    this.referenceService.list('/expense/reference')
      .subscribe(result => this.expenseCategories = result)
    this.referenceService.list('/income/reference')
      .subscribe(result => this.incomeCategories = result)
    this.filter().valueChanges.subscribe(() => this.load())
  }

  ngOnInit(): void {
    this.load()
  }

  documentPage(): DocumentPage {
    return this.documentService.documentPage
  }

  filter(): FormGroup {
    return this.documentService.filter
  }

  allExpenseCategories() {
    this.filter().patchValue({
      expenseCategories: this.expenseCategories.map(category => category.id)
    })
  }

  allIncomeCategories() {
    this.filter().patchValue({
      incomeCategories: this.incomeCategories.map(category => category.id)
    })
  }

  onPage(event: PageEvent) {
    this.documentService.documentPage.page = event.pageIndex
    this.load()
  }

  private load() {
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

  graph(id: string) {
    this.router.navigate(['flow-graph-chart', id]).then()
  }

}

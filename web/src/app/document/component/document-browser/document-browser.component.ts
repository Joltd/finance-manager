import {Component, OnInit, ViewChild} from "@angular/core";
import {DocumentService} from "../../service/document.service";
import {DocumentRow} from "../../model/document-row";
import {Router} from "@angular/router";
import {MatMenuTrigger} from "@angular/material/menu";
import {trigger} from "@angular/animations";
import {DocumentTyped} from "../../model/document-typed";
import {FormControl, FormGroup} from "@angular/forms";
import {DocumentExchange, DocumentExpense, DocumentIncome} from "../../model/document";
import * as moment from "moment";

@Component({
  selector: 'document-browser',
  templateUrl: 'document-browser.component.html',
  styleUrls: ['document-browser.component.scss']
})
export class DocumentBrowserComponent implements OnInit {

  documents: DocumentTyped[] = []
  filteredDocuments: DocumentTyped[] = []
  selection: boolean = false

  types = [
    {label: '[Empty]', value: null},
    {label: 'Expense', value: 'expense'},
    {label: 'Income', value: 'income'},
    {label: 'Exchange', value: 'exchange'}
  ]

  constructor(
    private router: Router,
    private documentService: DocumentService
  ) {
    this.filter().valueChanges.subscribe(() => this.filterOut())
  }

  ngOnInit(): void {
    this.load()
  }

  filter(): FormGroup {
    return this.documentService.filter
  }

  private load() {
    this.documentService.list().subscribe(result => {
      this.documents = result
      this.filterOut()
    })
  }

  private filterOut() {
    let filter = this.filter().value
    this.filteredDocuments = this.documents.filter(document => {
      if (filter.type != null && document.type != filter.type) {
        return false
      }

      if (filter.account != null) {
        if (document.type == 'expense') {
          let documentExpense = document.value as DocumentExpense
          if (documentExpense.account != filter.account) {
            return false
          }
        } else if (document.type == 'income') {
          let documentIncome = document.value as DocumentIncome
          if (documentIncome.account != filter.account) {
            return false
          }
        } else if (document.type == 'exchange') {
          let documentExchange = document.value as DocumentExchange
          if (documentExchange.accountFrom != filter.account && documentExchange.accountTo != filter.account) {
            return false
          }
        }
      }

      if (filter.dateFrom != null) {
        if (moment(document.value.date).isBefore(filter.dateFrom, 'day')) {
          return false
        }
      }

      if (filter.dateTo != null) {
        if (moment(document.value.date).isAfter(filter.dateTo, 'day')) {
          return false
        }
      }

      return true
    }).sort((left,right) => left.value.date > right.value.date ? -1 : 1)
  }

  select() {
    this.selection = true
  }

  add(type: string) {
    this.router.navigate(['document', type]).then()
  }

  edit(id: string) {
    this.router.navigate(['document', id]).then()
  }

  delete(id: string) {
    this.documentService.delete(id).subscribe(() => this.load())
  }

}

import {Component, OnInit, ViewChild} from "@angular/core";
import {DocumentService} from "../../service/document.service";
import {DocumentRow} from "../../model/document-row";
import {ActivatedRoute, Router} from "@angular/router";
import {MatMenuTrigger} from "@angular/material/menu";
import {trigger} from "@angular/animations";
import {DocumentTyped} from "../../model/document-typed";
import {FormControl, FormGroup} from "@angular/forms";
import {DocumentExchange, DocumentExpense, DocumentIncome} from "../../model/document";
import * as moment from "moment";
import {SettingsService} from "../../../settings/service/settings.service";
import {PageEvent} from "@angular/material/paginator";
import {DocumentPage} from "../../model/document-page";

@Component({
  selector: 'document-browser',
  templateUrl: 'document-browser.component.html',
  styleUrls: ['document-browser.component.scss']
})
export class DocumentBrowserComponent implements OnInit {

  selection: boolean = false

  types = [
    {label: 'Expense', value: 'expense'},
    {label: 'Income', value: 'income'},
    {label: 'Exchange', value: 'exchange'}
  ]

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private documentService: DocumentService,
    public settingsService: SettingsService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['currency']) {
        this.filter().patchValue({currency: params['currency']})
      }
      if (params['account']) {
        this.filter().patchValue({account: params['account']})
      }
      this.filter().valueChanges.subscribe(() => this.load())
    })
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

  onPage(event: PageEvent) {
    this.documentService.documentPage.page = event.pageIndex
    this.load()
  }

  private load() {
    this.documentService.list()
  }

  private filterOut() {
    // let filter = this.filter().value
    // this.filteredDocuments = this.documents.filter(document => {
    //   if (filter.type != null && document.type != filter.type) {
    //     return false
    //   }
    //
    //   if (filter.account != null) {
    //     if (document.type == 'expense') {
    //       let documentExpense = document.value as DocumentExpense
    //       if (documentExpense.account != filter.account) {
    //         return false
    //       }
    //     } else if (document.type == 'income') {
    //       let documentIncome = document.value as DocumentIncome
    //       if (documentIncome.account != filter.account) {
    //         return false
    //       }
    //     } else if (document.type == 'exchange') {
    //       let documentExchange = document.value as DocumentExchange
    //       if (documentExchange.accountFrom != filter.account && documentExchange.accountTo != filter.account) {
    //         return false
    //       }
    //     }
    //   }
    //
    //   if (filter.currency != null) {
    //     if (document.type == 'expense') {
    //       let documentExpense = document.value as DocumentExpense
    //       if (documentExpense.amount.currency != filter.currency) {
    //         return false
    //       }
    //     } else if (document.type == 'income') {
    //       let documentIncome = document.value as DocumentIncome
    //       if (documentIncome.amount.currency != filter.currency) {
    //         return false
    //       }
    //     } else if (document.type == 'exchange') {
    //       let documentExchange = document.value as DocumentExchange
    //       if (documentExchange.amountFrom.currency != filter.currency && documentExchange.amountTo.currency != filter.currency) {
    //         return false
    //       }
    //     }
    //   }
    //
    //   if (filter.dateFrom != null) {
    //     if (moment(document.value.date).isBefore(filter.dateFrom, 'day')) {
    //       return false
    //     }
    //   }
    //
    //   if (filter.dateTo != null) {
    //     if (moment(document.value.date).isAfter(filter.dateTo, 'day')) {
    //       return false
    //     }
    //   }
    //
    //   return true
    // }).sort((left,right) => left.value.date > right.value.date ? -1 : 1)
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

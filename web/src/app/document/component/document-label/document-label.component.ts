import {Component, HostBinding, Input, OnInit} from "@angular/core";
import {DocumentTyped} from "../../model/document-typed";
import {DocumentExchange, DocumentExpense, DocumentIncome} from "../../model/document";

@Component({
  selector: 'document-label',
  templateUrl: 'document-label.component.html',
  styleUrls: ['document-label.component.scss']
})
export class DocumentLabelComponent implements OnInit {

  @Input()
  @HostBinding('class.disabled')
  disabled: boolean = false

  @Input()
  hideDate: boolean = false

  @Input()
  hideAccount: boolean = false

  @Input()
  document!: DocumentTyped
  documentExpense: DocumentExpense | null = null
  documentIncome: DocumentIncome | null = null
  documentExchange: DocumentExchange | null = null
  unknown: boolean = false

  ngOnInit(): void {
    if (this.document.type == 'expense') {
      this.documentExpense = this.document.value as DocumentExpense
    } else if (this.document.type == 'income') {
      this.documentIncome = this.document.value as DocumentIncome
    } else if (this.document.type == 'exchange') {
      this.documentExchange = this.document.value as DocumentExchange
    } else {
      this.unknown = true
    }
  }

  exchangeAmountSame(): boolean {
    if (this.documentExchange == null) {
      return false
    }
    let from = this.documentExchange.amountFrom
    let to = this.documentExchange.amountTo
    return from.value == to.value && from.currency == to.currency
  }

  exchangeAccountSame(): boolean {
    if (this.documentExchange == null) {
      return false
    }
    return this.documentExchange.accountFrom == this.documentExchange.accountTo
  }

}

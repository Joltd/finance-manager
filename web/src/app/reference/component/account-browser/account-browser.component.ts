import {Component, OnInit} from "@angular/core";
import {AccountService} from "../../service/account.service";
import {Router} from "@angular/router";
import {Account, AccountType} from "../../model/account";
import { CommonLayoutComponent } from "../../../common/component/common-layout/common-layout.component";

@Component({
  selector: 'account-browser',
  templateUrl: 'account-browser.component.html',
  styleUrls: ['account-browser.component.scss']
})
export class AccountBrowserComponent implements OnInit {

  accounts: Account[] = []
  expenses: Account[] = []
  incomes: Account[] = []

  constructor(
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.accountService.list()
      .subscribe(result => {
        this.accounts = result.filter(account => account.type == 'ACCOUNT')
        this.expenses = result.filter(account => account.type == 'EXPENSE')
        this.incomes = result.filter(account => account.type == 'INCOME')
      })
  }

  add() {
    this.router.navigate(['account', 'new']).then()
  }

  edit(id: string) {
    this.router.navigate(['account', id]).then()
  }

  delete(id: string) {
    this.accountService.delete(id)
      .subscribe(() => this.load())
  }

}

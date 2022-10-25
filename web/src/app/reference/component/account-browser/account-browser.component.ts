import {Component, OnInit} from "@angular/core";
import {AccountService} from "../../service/account.service";
import {Router} from "@angular/router";
import {Account} from "../../module/account";

@Component({
  selector: 'account-browser',
  templateUrl: 'account-browser.component.html',
  styleUrls: ['account-browser.component.scss']
})
export class AccountBrowserComponent implements OnInit {

  accounts: Account[] = []

  constructor(
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.accountService.list()
      .subscribe(result => this.accounts = result.sort((left,right) => left.name > right.name ? -1 : 1))
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

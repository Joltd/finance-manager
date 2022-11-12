import {Component, OnInit} from "@angular/core";
import {AccountService} from "../../service/account.service";
import {Router} from "@angular/router";
import {Account} from "../../model/account";
import {ShortMessageService} from "../../../common/service/short-message.service";

@Component({
  selector: 'account-browser',
  templateUrl: 'account-browser.component.html',
  styleUrls: ['account-browser.component.scss']
})
export class AccountBrowserComponent implements OnInit {

  accounts: Account[] = []

  constructor(
    private accountService: AccountService,
    private router: Router,
    private shortMessageService: ShortMessageService
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.accountService.list()
      .subscribe(result => this.accounts = result.sort((left,right) => left.name > right.name ? 1 : -1))
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

  usage(id: string) {
    this.accountService.usage(id)
      .subscribe(result => this.shortMessageService.show(`Used in ${result.value}`))
  }

  deleteDocuments(id: string) {
    this.accountService.deleteDocuments(id)
      .subscribe(() => this.shortMessageService.show("Done"))
  }

}

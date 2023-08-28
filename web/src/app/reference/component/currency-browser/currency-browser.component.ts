import {Component, OnInit} from "@angular/core";
import {Currency} from "../../model/currency";
import {Router} from "@angular/router";
import {CurrencyService} from "../../service/currency.service";

@Component({
  selector: 'currency-browser',
  templateUrl: './currency-browser.component.html',
  styleUrls: ['./currency-browser.component.scss']
})
export class CurrencyBrowserComponent implements OnInit {

  currencies: Currency[] = []

  constructor(
    private currencyService: CurrencyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.currencyService.list()
      .subscribe(result => this.currencies = result)
  }

  add() {
    this.router.navigate(['currency', 'new']).then()
  }

  edit(id: string) {
    this.router.navigate(['currency', id]).then()
  }

  delete(id: string) {
    this.currencyService.delete(id)
      .subscribe(() => this.load())
  }

}

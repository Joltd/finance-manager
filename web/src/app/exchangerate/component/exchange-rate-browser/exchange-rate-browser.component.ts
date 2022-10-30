import {Component, OnInit} from "@angular/core";
import {ExchangeRateService} from "../../service/exchange-rate.service";
import {ExchangeRate} from "../../model/exchange-rate";
import {Router} from "@angular/router";

@Component({
  selector: 'exchange-rate-browser',
  templateUrl: 'exchange-rate-browser.component.html',
  styleUrls: ['exchange-rate-browser.component.scss']
})
export class ExchangeRateBrowserComponent implements OnInit {

  exchangeRates: ExchangeRate[] = []

  constructor(
    private router: Router,
    private exchangeRateService: ExchangeRateService
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.exchangeRateService.list()
      .subscribe(result => this.exchangeRates = result.sort((left,right) => left.date > right.date ? -1 : 1))
  }

  add() {
    this.router.navigate(['exchange-rate', 'new']).then()
  }

  edit(id: string) {
    this.router.navigate(['exchange-rate', id]).then()
  }

  delete(id: string) {
    this.exchangeRateService.delete(id)
      .subscribe(() => this.load())
  }

}

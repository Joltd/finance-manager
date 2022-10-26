import {Component, OnInit} from "@angular/core";
import {AccountBalance} from "../../model/account-balance";
import {Dashboard} from "../../model/dashboard";
import {DashboardService} from "../../service/dashboard.service";
import {Router} from "@angular/router";

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  dashboard: Dashboard = new Dashboard()

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.dashboardService.load()
      .subscribe(result => this.dashboard = result)
  }

  viewDocuments(account: string, currency: string) {
    if (!account) {
      return
    }
    this.router.navigate(
      ['document'],
      {
        queryParams: {account, currency}
      }
    ).then()
  }

}

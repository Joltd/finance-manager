import {Component, OnInit} from "@angular/core";
import {AccountBalance} from "../../model/account-balance";
import {Dashboard} from "../../model/dashboard";
import {DashboardService} from "../../service/dashboard.service";

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  dashboard: Dashboard = new Dashboard()

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.dashboardService.load()
      .subscribe(result => this.dashboard = result)
  }

}

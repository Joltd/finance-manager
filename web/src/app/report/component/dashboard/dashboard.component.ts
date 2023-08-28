import {Component, OnInit} from "@angular/core";
import {Dashboard} from "../../model/dashboard";
import {DashboardService} from "../../service/dashboard.service";

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  dashboard!: Dashboard

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.dashboardService.load()
      .subscribe(result => this.dashboard = result)
  }

}

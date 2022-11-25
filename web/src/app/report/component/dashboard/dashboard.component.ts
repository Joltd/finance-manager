import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {AccountBalance} from "../../model/account-balance";
import {Dashboard} from "../../model/dashboard";
import {DashboardService} from "../../service/dashboard.service";
import {Router} from "@angular/router";
import {DocumentService} from "../../../document/service/document.service";

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  dashboard: Dashboard = new Dashboard()

  constructor(
    private dashboardService: DashboardService,
    private documentService: DocumentService,
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
    this.documentService.updateFilter({account, currency})
    this.router.navigate(['document']).then()
  }

  fastExpense() {
    this.router.navigate(['fast-expense']).then()
  }

}

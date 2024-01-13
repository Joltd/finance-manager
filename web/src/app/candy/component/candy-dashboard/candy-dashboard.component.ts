import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CandyExpenseComponent } from "../candy-expense/candy-expense.component";
import { CandyService } from "../../service/candy.service";
import { CandyDashboard } from "../../model/candy";

@Component({
  selector: 'candy-dashboard',
  templateUrl: './candy-dashboard.component.html',
  styleUrls: ['./candy-dashboard.component.scss']
})
export class CandyDashboardComponent implements OnInit {

  dashboard!: CandyDashboard

  constructor(
    private candyService: CandyService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.candyService.dashboard()
      .subscribe(result => this.dashboard = result)
  }

  add() {
    this.dialog.open(CandyExpenseComponent)
      .afterClosed()
      .subscribe(() => {
        this.load()
      })
  }

}

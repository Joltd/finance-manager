import {Component, OnInit} from "@angular/core";
import {FundSnapshot} from "../../model/fund-snapshor";
import {FundSnapshotService} from "../../service/fund-snapshot.service";

@Component({
  selector: 'fund-snapshot-view',
  templateUrl: './fund-snapshot-view.component.html',
  styleUrls: ['./fund-snapshot-view.component.scss']
})
export class FundSnapshotViewComponent implements OnInit {

  fundSnapshots: FundSnapshot[] = []
  fundSnapshot: FundSnapshot | null = null
  id: string | null = null

  constructor(
    private fundSnapshotService: FundSnapshotService
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.fundSnapshotService.load()
      .subscribe(result => {
        this.fundSnapshots = result
        if (this.fundSnapshots.length > 0) {
          this.loadFundSnapshot(this.fundSnapshots[0].id)
        }
      })
  }

  loadFundSnapshot(id: string) {
    this.id = id
    this.fundSnapshotService.byId(id)
      .subscribe(result => this.fundSnapshot = result)
  }

  balanceHeight(weight: number): string {
    return Math.max(3 * weight / 100, .4) + 'em'
  }

}

import {Component, OnInit} from "@angular/core";
import {FundSnapshot} from "../../model/fund-snapshor";
import {FundSnapshotService} from "../../service/fund-snapshot.service";
import {FundGraphService} from "../../service/fund-graph.service";
import {ShortMessageService} from "../../../common/service/short-message.service";
import {GraphState} from "../../model/graph-state";

@Component({
  selector: 'fund-snapshot-view',
  templateUrl: './fund-snapshot-view.component.html',
  styleUrls: ['./fund-snapshot-view.component.scss']
})
export class FundSnapshotViewComponent implements OnInit {

  graph!: GraphState
  fundSnapshots: FundSnapshot[] = []
  fundSnapshot: FundSnapshot | null = null
  id!: string

  constructor(
    private fundSnapshotService: FundSnapshotService,
    private fundGraphService: FundGraphService,
    private shortMessageService: ShortMessageService
  ) {}

  ngOnInit(): void {
    this.load()
  }

  load() {
    this.fundGraphService.getState()
      .subscribe(result => {
        this.graph = result
        this.loadFundSnapshot('0')
        this.fundSnapshotService.load()
          .subscribe(result => {
            this.fundSnapshots = result
          })
      })
  }

  loadFundSnapshot(id: string) {
    this.id = id
    if (id == '0') {
      this.fundSnapshot = {
        id: '',
        date: '',
        accounts: this.graph.accounts
      }
    } else {
      this.fundSnapshotService.byId(id)
        .subscribe(result => this.fundSnapshot = result)
    }
  }

  graphError(): string {
    if (this.graph?.error == null) {
      return ''
    } else {
      return this.graph.error
    }
  }

  balanceHeight(weight: number): string {
    return Math.max(3 * weight / 100, .4) + 'em'
  }

  resetGraph(date: any) {
    this.fundGraphService.resetGraph(date)
      .subscribe(() => {
        this.shortMessageService.show('Done')
        this.load()
      })
  }

  rebuildGraph() {
    this.fundGraphService.rebuildGraph()
      .subscribe(() => this.shortMessageService.show('Started'))
  }

}

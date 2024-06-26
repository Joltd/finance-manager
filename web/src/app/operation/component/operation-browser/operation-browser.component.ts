import {AfterViewInit, Component, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {OperationService} from "../../service/operation.service";
import {PageEvent} from "@angular/material/paginator";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {MatExpansionPanel} from "@angular/material/expansion";
import { EntityFilterComponent } from "../../../entity/component/entity-filter/entity-filter.component";
import { MatDialog } from "@angular/material/dialog";
import { EntityService } from "../../../entity/service/entity.service";
import { OperationFilterComponent } from "../operation-filter/operation-filter.component";

@Component({
  selector: 'operation-browser',
  templateUrl: './operation-browser.component.html',
  styleUrls: ['./operation-browser.component.scss']
})
export class OperationBrowserComponent implements AfterViewInit {

  @ViewChild(MatExpansionPanel)
  filter!: MatExpansionPanel

  constructor(
    private router: Router,
    private entityService: EntityService,
    public operationService: OperationService,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit(): void {
    this.load()
  }

  onPage(event: PageEvent) {
    this.operationService.operationPage.page = event.pageIndex
    this.load()
  }

  private load() {
    this.operationService.list()
  }

  openFilter() {
    let config = {
      data: this.operationService.filter
    }
    this.dialog.open(OperationFilterComponent, config)
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.operationService.filter = result
          this.load()
        }
      })
  }

  add() {
    this.router.navigate(['operation', 'new']).then()
  }

  edit(id: string) {
    this.router.navigate(['operation', id]).then()
  }

  copy(id: string) {
    this.router.navigate(
      ['operation', 'new'],
      {queryParams: {copy: id}}
    ).then()
  }

  delete(id: string) {
    this.operationService.delete(id).subscribe(() => this.load())
  }

}

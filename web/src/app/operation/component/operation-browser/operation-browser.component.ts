import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {OperationService} from "../../service/operation.service";
import {PageEvent} from "@angular/material/paginator";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {MatExpansionPanel} from "@angular/material/expansion";
import {ImportData} from "../../../importexport/model/import-data";

@Component({
  selector: 'operation-browser',
  templateUrl: './operation-browser.component.html',
  styleUrls: ['./operation-browser.component.scss']
})
export class OperationBrowserComponent implements OnInit,AfterViewInit,OnDestroy {

  @ViewChild('filter')
  filter!: MatExpansionPanel

  constructor(
    private router: Router,
    public operationService: OperationService,
    private toolbarService: ToolbarService
  ) {}

  ngOnInit(): void {
    this.toolbarService.setup('Operation', [
      {
        name: 'load',
        icon: 'done',
        action: () => {
          this.filter.close()
          this.load()
        }
      }
    ])
  }

  ngAfterViewInit(): void {
    this.load()
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
  }

  onPage(event: PageEvent) {
    this.operationService.operationPage.page = event.pageIndex
    this.load()
  }

  private load() {
    this.operationService.list()
  }

  add() {
    this.router.navigate(['operation', 'new']).then()
  }

  edit(id: string) {
    this.router.navigate(['operation', id]).then()
  }

  copy(id: string) {
    this.router.navigate(
      ['operation', id],
      {queryParams: {copy: true}}
    ).then()
  }

  delete(id: string) {
    this.operationService.delete(id).subscribe(() => this.load())
  }

}

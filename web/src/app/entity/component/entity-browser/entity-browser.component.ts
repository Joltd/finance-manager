import { Component, OnInit } from "@angular/core";
import { EntityService } from "../../service/entity.service";
import { ActivatedRoute } from "@angular/router";
import { PageEvent } from "@angular/material/paginator";
import { firstValueFrom } from "rxjs";
import { ArrayDataSource } from "@angular/cdk/collections";
import { MatDialog } from "@angular/material/dialog";
import { EntityFilterComponent } from "../entity-filter/entity-filter.component";
import { EntitySortComponent } from "../entity-sort/entity-sort.component";
import { Entity } from "../../model/entity";

@Component({
  selector: 'entity-browser',
  templateUrl: 'entity-browser.component.html',
  styleUrls: ['entity-browser.component.scss']
})
export class EntityBrowserComponent implements OnInit {

  entity!: Entity
  fieldNames: string[] = []
  page = {
    page: 0,
    size: 20,
    total: 0
  }
  dataSource: ArrayDataSource<any> = new ArrayDataSource<any>([])
  hasData: boolean = false
  currentValue: any = null

  constructor(
    private activatedRoute: ActivatedRoute,
    private entityService: EntityService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.onInit().then()
  }

  private async onInit() {
    let params = await firstValueFrom(this.activatedRoute.params)
    await this.entityService.setEntity(params['name'])
    this.entity = this.entityService.entity
    this.fieldNames = this.entityService.entity.fields.map(field => field.name)
    await this.load()
  }

  onPage(event: PageEvent) {
    this.entityService.page.page = event.pageIndex
    this.entityService.page.size = event.pageSize
    this.load().then()
  }

  onSort(event: any) {
    this.entityService.sort = []
    if (event.direction != '') {
      this.entityService.sort = [
        {
          field: event.active,
          direction: event.direction.toUpperCase()
        }
      ]
    }
    this.load().then()
  }

  private async load() {
    await this.entityService.load()
    this.page = {
      page: this.entityService.page.page,
      size: this.entityService.page.size,
      total: this.entityService.page.total
    }
    this.hasData = this.entityService.page.values.length > 0
    this.dataSource = new ArrayDataSource<any>(this.entityService.page.values)
  }

  openFilter() {
    this.dialog.open(EntityFilterComponent)
      .afterClosed()
      .subscribe(() => this.load())
  }

  openSort() {
    this.dialog.open(EntitySortComponent)
      .afterClosed()
      .subscribe(() => this.load())
  }

  add() {

  }

  edit() {

  }

  delete() {
    this.entityService.delete(this.currentValue.id)
      .subscribe(() => this.load().then())
  }

}

import {Component, OnDestroy, OnInit} from "@angular/core";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {Router} from "@angular/router";
import {OperationReviseService} from "../../service/operation-revise.service";
import {OperationRevise} from "../../model/operation-revise";

@Component({
  selector: 'operation-revise-browser',
  templateUrl: './operation-revise-browser.component.html',
  styleUrls: ['./operation-revise-browser.component.scss']
})
export class OperationReviseBrowserComponent implements OnInit {

  operationReviseList: OperationRevise[] = []

  constructor(
    private operationReviseService: OperationReviseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load()
  }

  private load() {
    this.operationReviseService.list()
      .subscribe(result => this.operationReviseList = result)
  }

  add() {
    this.router.navigate(['operation-revise', 'new']).then()
  }

  edit(id: string) {
    this.router.navigate(['operation-revise', id]).then()
  }

  delete(id: string) {
    this.operationReviseService.delete(id)
      .subscribe(() => this.load())
  }
}

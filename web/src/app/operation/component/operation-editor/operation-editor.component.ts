import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {ToolbarService} from "../../../common/service/toolbar.service";
import {Operation} from "../../model/operation";
import {OperationService} from "../../service/operation.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'operation-editor',
  templateUrl: './operation-editor.component.html',
  styleUrls: ['./operation-editor.component.css']
})
export class OperationEditorComponent implements OnInit, OnDestroy {

  operation!: Operation

  constructor(
    public operationService: OperationService,
    private toolbarService: ToolbarService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.toolbarService.setup('Operation', [
      { name: 'save', icon: 'done', action: () => this.onSave() },
      { name: 'close', icon: 'close', action: () => this.onClose() }
    ])
    this.activatedRoute.params
      .subscribe(params => {
        let id = params['id']
        if (id == 'new') {
          this.activatedRoute.queryParams
            .subscribe(queryParams => {
              let copyId = queryParams['copy']
              if (copyId != null) {
                this.operationService.byId(id)
                  .subscribe(result => {
                    result.id = null
                    this.operation = result
                  })
              }
            })
        } else {
          this.operationService.byId(id)
            .subscribe(result => this.operation = result)
        }
      })
  }

  ngOnDestroy(): void {
    this.toolbarService.reset()
  }

  private save(operation: Operation) {
    this.operationService.update(operation)
      .subscribe(() => {
        this.close()
      })
  }

  private close() {
    this.router.navigate(['operation']).then()
  }

}

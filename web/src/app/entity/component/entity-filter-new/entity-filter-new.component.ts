import { Component, Inject } from "@angular/core";
import { FlatTreeControl, NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeNestedDataSource } from "@angular/material/tree";
import {
  EntityField,
  EntityFilterCondition,
  EntityFilterDialogData,
  EntityFilterExpression,
  EntityFilterNode, EntityFilterOperator
} from "../../model/entity";
import { AdaptiveService } from "../../../common/service/adaptive.service";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { EntityFilterExpressionComponent } from "../entity-filter-expression/entity-filter-expression.component";

@Component({
  selector: 'entity-filter-new',
  templateUrl: 'entity-filter-new.component.html',
  styleUrls: ['entity-filter-new.component.scss']
})
export class EntityFilterNewComponent {

  fields: EntityField[] = []
  expression: EntityFilterExpression | null = null

  treeControl = new NestedTreeControl<EntityFilterNode>(node => node.children)
  dataSource = new MatTreeNestedDataSource<EntityFilterNode>()

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<EntityFilterNewComponent>,
    @Inject(MAT_DIALOG_DATA) data: EntityFilterDialogData,
    private adaptiveService: AdaptiveService
  ) {
    this.fields = data.fields
    if (data.newCondition) {
      this.dataSource.data = [data.newCondition]
    } else {
      this.dataSource.data = [{
        negate: false,
        expression: null,
        condition: 'AND',
        children: []
      }]
    }
  }

  ngOnInit(): void {
    if (this.adaptiveService.desktop) {
      this.dialogRef.updateSize('700px', '500px')
    } else {
      this.dialogRef.updateSize('90vw', '85vh')
    }
  }

  hasChild = (_: number, node: EntityFilterNode) => node.condition != null

  apply() {

  }

  close() {
    this.dialogRef.close()
  }

  addCondition(node: EntityFilterNode) {
    let childNode = {
      negate: false,
      expression: null,
      condition: 'AND',
      children: []
    } as any
    node.children.push(childNode)
  }

  addExpression(node: EntityFilterNode) {
    let childNode = {
      negate: false,
      expression: {
        id: 0,
        field: null,
        operator: null,
        value: null
      },
      condition: null,
      children: []
    } as any
    node.children.push(childNode)
    this.edit(childNode)
  }

  edit(node: EntityFilterNode) {
    let config = {
      data: {
        fields: this.fields,
        expression: node.expression
      }
    }
    this.dialog.open(EntityFilterExpressionComponent, config)
      .afterClosed()
      .subscribe(result => {
        if (result) {
          node.expression = result
        }
      })
  }

  delete(node: EntityFilterNode) {

  }

  protected readonly Object = Object;
}

interface InternalEntityFilterNode {
  level: number
  negate: boolean
  expression: InternalEntityFilterExpression | null
  condition: EntityFilterCondition | null
  children: InternalEntityFilterNode[]
}

interface InternalEntityFilterExpression {
  id: number,
  field: EntityField,
  operator: EntityFilterOperator,
  value: any
}

interface Node {
  expandable: boolean;
  level: number;
  label: string;
}

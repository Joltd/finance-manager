import { Component, Inject } from "@angular/core";
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import {
  EntityField,
  EntityFilterDialogData,
  EntityFilterExpression,
  EntityFilterNode, EntityFilterOperator, OPERATOR_LABELS
} from "../../model/entity";
import { AdaptiveService } from "../../../common/service/adaptive.service";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { EntityFilterExpressionComponent } from "../entity-filter-expression/entity-filter-expression.component";
import { Observable } from "rxjs";

@Component({
  selector: 'entity-filter',
  templateUrl: 'entity-filter.component.html',
  styleUrls: ['entity-filter.component.scss']
})
export class EntityFilterComponent {

  fields: EntityField[] = []
  expression: EntityFilterExpression | null = null

  treeControl = new NestedTreeControl<EntityFilterNode>(node => node.children)
  dataSource = new MatTreeNestedDataSource<EntityFilterNode>()
  private parentIndex: Map<number,EntityFilterNode> = new Map<number,EntityFilterNode>()

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<EntityFilterComponent>,
    @Inject(MAT_DIALOG_DATA) data: EntityFilterDialogData,
    private adaptiveService: AdaptiveService
  ) {
    this.fields = data.fields
    if (data.filter) {
      this.dataSource.data = [data.filter]
    } else {
      this.dataSource.data = [{
        id: this.random(),
        negate: false,
        expression: null,
        condition: 'AND',
        children: []
      }]
    }
    this.index(null, this.dataSource.data)
    this.treeControl.expandDescendants(this.dataSource.data[0])
  }

  ngOnInit(): void {
    if (this.adaptiveService.desktop) {
      this.dialogRef.updateSize('700px', '500px')
    } else {
      this.dialogRef.updateSize('90vw', '85vh')
    }
  }

  hasChild = (_: number, node: EntityFilterNode) => node.condition != null

  isRoot(node: EntityFilterNode): boolean {
    return this.parentIndex.get(node.id) == null
  }

  operatorLabel(operator: any): string {
    return OPERATOR_LABELS[operator as EntityFilterOperator]
  }

  apply() {
    this.dialogRef.close(this.dataSource.data[0])
  }

  close() {
    this.dialogRef.close()
  }

  addCondition(parentNode: EntityFilterNode) {
    let node = {
      negate: false,
      expression: null,
      condition: 'AND',
      children: []
    } as any
    this.doAdd(node, parentNode)
  }

  addExpression(parentNode: EntityFilterNode) {
    let node = {
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

    this.doEdit(node.expression)
      .subscribe(result => {
        if (result) {
          node.expression = result
          this.doAdd(node, parentNode)
        }
      })
  }

  edit(node: EntityFilterNode) {
    if (node.expression == null) {
      return
    }
    this.doEdit(node.expression)
      .subscribe(result => {
        if (result) {
          node.expression = result
        }
      })
  }

  delete(node: EntityFilterNode) {
    let parentNode = this.parentIndex.get(node.id)
    if (!parentNode) {
      return
    }

    parentNode.children = parentNode.children.filter(child => child.id != node.id)
    this.parentIndex.delete(node.id)
    this.treeControl.getDescendants(node)
      .forEach(child => this.parentIndex.delete(child.id))
    this.refresh()
  }

  private doAdd(node: EntityFilterNode, parent: EntityFilterNode) {
    node.id = this.random()
    parent.children.push(node)
    this.parentIndex.set(node.id, parent)
    this.refresh()
    this.treeControl.expand(parent)
  }

  private doEdit(expression: EntityFilterExpression): Observable<any> {
    let config = {
      data: {
        fields: this.fields,
        expression: expression
      }
    }
    return this.dialog.open(EntityFilterExpressionComponent, config)
      .afterClosed()
  }

  private refresh() {
    let data = this.dataSource.data
    this.dataSource.data = []
    this.dataSource.data = data
  }

  private index(parent: EntityFilterNode | null, nodes: EntityFilterNode[]) {
    for (let node of nodes) {
      node.id = this.random()
      if (parent) {
        this.parentIndex.set(node.id, parent)
      }
      this.index(node, node.children)
    }
  }

  private random(): number {
    return Math.ceil(Math.random() * 1000000)
  }

}

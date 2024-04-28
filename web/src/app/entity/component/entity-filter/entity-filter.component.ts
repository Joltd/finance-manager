import { Component, Inject } from "@angular/core";
import {
  EntityField,
  EntityFieldType,
  EntityFilterDialogData,
  EntityFilterExpression,
  EntityFilterNode,
  EntityFilterOperator,
  OPERATOR_LABELS
} from "../../model/entity";
import { AdaptiveService } from "../../../common/service/adaptive.service";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { EntityFilterExpressionComponent } from "../entity-filter-expression/entity-filter-expression.component";
import { Observable } from "rxjs";

@Component({
  selector: 'entity-filter',
  templateUrl: 'entity-filter.component.html',
  styleUrls: ['entity-filter.component.scss'],
})
export class EntityFilterComponent {

  fields: EntityField[] = []
  filter!: EntityFilterNode
  node!: EntityFilterNode
  private parentIndex: Map<number,EntityFilterNode> = new Map<number,EntityFilterNode>()

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<EntityFilterComponent>,
    @Inject(MAT_DIALOG_DATA) data: EntityFilterDialogData,
    private adaptiveService: AdaptiveService
  ) {
    this.fields = data.fields
    if (data.filter) {
      this.filter = data.filter
    } else {
      this.filter = {
        id: this.random(),
        negate: false,
        expression: null,
        condition: 'AND',
        children: []
      }
    }
    this.node = this.filter
    this.index(null, [this.filter])
  }

  ngOnInit(): void {
    if (this.adaptiveService.desktop) {
      this.dialogRef.updateSize('700px', '500px')
    } else {
      this.dialogRef.updateSize('95vw', '85vh')
    }
  }

  isRoot(): boolean {
    return this.parentIndex.get(this.node.id) == null
  }

  breadcrumbs(): string {
    let result = ''
    let node = this.node
    while (true) {
      let parent = this.parentIndex.get(node.id)
      if (parent) {
        result = parent.condition + '(' + result
        node = parent
      } else {
        return result
      }
    }
  }

  fieldType(field: string): EntityFieldType {
    return this.fields.find(it => it.name == field)?.type || 'STRING'
  }

  isValueArray(value: any): boolean {
    return Array.isArray(value)
  }

  asValueArray(value: any): any[] {
    return value as any[]
  }

  operatorLabel(operator: any): string {
    return OPERATOR_LABELS[operator as EntityFilterOperator]
  }

  apply() {
    this.dialogRef.close(this.filter)
  }

  close() {
    this.dialogRef.close()
  }

  clear() {
    this.filter = {
      id: this.random(),
      negate: false,
      expression: null,
      condition: 'AND',
      children: []
    }
    this.node = this.filter
    this.index(null, [this.filter])
  }

  wrap() {
    let newParent = {
      id: this.random(),
      negate: false,
      expression: null,
      condition: 'AND',
      children: [this.node]
    } as EntityFilterNode

    let oldParent = this.parentIndex.get(this.node.id)
    if (oldParent) {
      this.parentIndex.set(newParent.id, oldParent);
      let childIndex = oldParent.children.findIndex(child => child.id == this.node.id)
      oldParent.children[childIndex] = newParent
    } else {
      this.filter = newParent
    }

    this.parentIndex.set(this.node.id, newParent);

    this.node = newParent
  }

  addCondition(parentNode: EntityFilterNode) {
    let node = {
      negate: false,
      expression: null,
      condition: 'AND',
      children: []
    } as any
    this.doAdd(node, parentNode)
    this.edit(node)
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
    if (node.condition != null) {
      this.node = node
    } else if (node.expression != null) {
      this.doEdit(node.expression)
        .subscribe(result => {
          if (result) {
            node.expression = result
          }
        })
    }
  }

  copy(node: EntityFilterNode) {
    let parentNode = this.parentIndex.get(node.id)
    this.doCopy(node, parentNode)
  }

  private doCopy(node: EntityFilterNode, parentNode?: EntityFilterNode) {
    if (node.expression && parentNode) {

      let newNode = {
        negate: node.negate,
        expression: {
          id: 0,
          field: node.expression.field,
          operator: node.expression.operator,
          value: node.expression.value
        },
        condition: null,
        children: []
      } as any
      this.doAdd(newNode, parentNode)

    } else if (node.condition) {

      let newNode = {
        negate: node.negate,
        expression: null,
        condition: node.condition,
        children: []
      } as any
      this.doAdd(newNode, parentNode)
      newNode.condition = node.children.map(child => this.doCopy(child, newNode))

    }
  }

  delete(node: EntityFilterNode) {
    let parentNode = this.parentIndex.get(node.id)
    if (!parentNode) {
      return
    }

    parentNode.children = parentNode.children.filter(child => child.id != node.id)
    this.parentIndex.delete(node.id)
  }

  back() {
    let parent = this.parentIndex.get(this.node.id)
    if (parent) {
      this.node = parent
    }
  }

  private doAdd(node: EntityFilterNode, parent?: EntityFilterNode) {
    node.id = this.random()
    if (parent) {
      parent.children.push(node)
      this.parentIndex.set(node.id, parent)
    } else {
      this.filter = node
    }

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

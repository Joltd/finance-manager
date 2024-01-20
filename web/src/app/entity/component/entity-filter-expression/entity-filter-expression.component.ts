import { Component, Inject, OnInit } from "@angular/core";
import {
  EntityField,
  EntityFieldType,
  EntityFilterExpressionDialogData,
  EntityFilterOperator, OPERATOR_LABELS
} from "../../model/entity";
import { Reference } from "../../../common/model/reference";
import { Currency } from "../../../reference/model/currency";
import { CurrencyService } from "../../../reference/service/currency.service";
import { EntityService } from "../../service/entity.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AdaptiveService } from "../../../common/service/adaptive.service";

@Component({
  selector: 'entity-filter-expression',
  templateUrl: './entity-filter-expression.component.html',
  styleUrls: ['./entity-filter-expression.component.scss']
})
export class EntityFilterExpressionComponent implements OnInit {

  private config: { [key in EntityFieldType]: EntityFilterOperator[] } = {
    'ID': ['EQUALS', 'IS_NULL',],
    'STRING': ['EQUALS', 'LIKE', 'IS_NULL',],
    'NUMBER': ['EQUALS', 'GREATER', 'GREATER_EQUALS', 'LESS', 'LESS_EQUALS', 'IS_NULL',],
    'BOOLEAN': ['IN_LIST',],
    'DATE': ['EQUALS', 'GREATER', 'GREATER_EQUALS', 'LESS', 'LESS_EQUALS', 'IS_NULL',],
    'ENUM': ['IN_LIST',],
    'REFERENCE': ['IN_LIST',],
    'AMOUNT': [],
    'JSON': [],
  }
  references: { [key: string]: Reference[] } = {}

  fields: EntityField[] = []
  expression!: InternalEntityFilterExpression

  constructor(
    private dialogRef: MatDialogRef<EntityFilterExpressionComponent>,
    @Inject(MAT_DIALOG_DATA) data: EntityFilterExpressionDialogData,
    private entityService: EntityService,
    private currencyService: CurrencyService,
    private adaptiveService: AdaptiveService
  ) {
    this.fields = data.fields
    this.expression = {
      id: data.expression.id,
      field: this.fields.find(field => field.name == data.expression.field)!,
      operator: data.expression.operator,
      value: data.expression.value,
    }
  }

  ngOnInit(): void {
    if (this.adaptiveService.desktop) {
      this.dialogRef.updateSize('300px')
    } else {
      this.dialogRef.updateSize('90vw')
    }
  }

  save() {
    let result = {
      id: this.expression.id,
      field: this.expression.field.name,
      operator: this.expression.operator,
      value: this.expression.value,
    }
    this.dialogRef.close(result)
  }

  close() {
    this.dialogRef.close()
  }

  getOperators(fieldType: EntityFieldType): EntityFilterOperator[] {
    return Object.keys(OPERATOR_LABELS)
      .map(key => key as EntityFilterOperator)
      .filter(operator => this.config[fieldType].includes(operator))
  }

  fieldChanged() {
    let operators = this.config[this.expression.field.type]
    if (operators.length == 1) {
      this.expression.operator = operators[0]
    }
  }

  loadReferences() {
    let skip = this.expression.field.type != 'REFERENCE'
    if (skip) {
      return
    }

    if (this.references[this.expression.field.referenceName!]) {
      return;
    }

    this.entityService.referenceList(this.expression.field.referenceName!)
      .subscribe(result => {
        this.references[this.expression.field.referenceName!] = result
      })
  }

  getCurrencies(): Currency[] {
    return this.currencyService.currencies
  }

  isValueInputVisible(): boolean {
    if (!this.expression.operator) {
      return false
    }
    return this.expression.field.type == 'REFERENCE'
      || this.expression.field.type == 'ENUM'
      || this.expression.field.type == 'BOOLEAN'
      || this.expression.operator != 'IS_NULL'
  }

  isMultiselectInput(): boolean {
    return this.expression.field.type == 'ENUM'
      || this.expression.field.type == 'BOOLEAN'
  }

  isReferenceInput(): boolean {
    return this.expression.field.type == 'REFERENCE'
  }

  isDateInput(): boolean {
    return this.expression.field.type == 'DATE' && (
      this.expression.operator == 'EQUALS'
      || this.expression.operator == 'GREATER'
      || this.expression.operator == 'GREATER_EQUALS'
      || this.expression.operator == 'LESS'
      || this.expression.operator == 'LESS_EQUALS'
    )
  }

  isNumberInput(): boolean {
    return (
      this.expression.field.type == 'NUMBER' && (
        this.expression.operator == 'EQUALS'
        || this.expression.operator == 'GREATER'
        || this.expression.operator == 'GREATER_EQUALS'
        || this.expression.operator == 'LESS'
        || this.expression.operator == 'LESS_EQUALS'
      )
    ) || (
      this.expression.field.type == 'AMOUNT' && (
        this.expression.operator == 'EQUALS'
        || this.expression.operator == 'GREATER'
        || this.expression.operator == 'GREATER_EQUALS'
        || this.expression.operator == 'LESS'
        || this.expression.operator == 'LESS_EQUALS'
      )
    )
  }

  protected readonly OPERATOR_LABELS = OPERATOR_LABELS;
}

export interface InternalEntityFilterExpression {
  id: number,
  field: EntityField,
  operator: EntityFilterOperator,
  value: any
}

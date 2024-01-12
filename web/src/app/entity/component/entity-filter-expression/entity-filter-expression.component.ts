import { Component, Inject } from "@angular/core";
import {
  EntityField,
  EntityFieldType,
  EntityFilterExpression, EntityFilterExpressionDialogData,
  EntityFilterOperator, OPERATOR_LABELS
} from "../../model/entity";
import { Reference } from "../../../common/model/reference";
import { lastValueFrom } from "rxjs";
import { Currency } from "../../../reference/model/currency";
import { CurrencyService } from "../../../reference/service/currency.service";
import { EntityService } from "../../service/entity.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'entity-filter-expression',
  templateUrl: './entity-filter-expression.component.html',
  styleUrls: ['./entity-filter-expression.component.scss']
})
export class EntityFilterExpressionComponent {

  private config: { [key in EntityFieldType]: EntityFilterOperator[] } = {
    'ID': ['EQUALS', 'NOT_EQUALS', 'IS_NULL', 'IS_NOT_NULL',],
    'STRING': ['EQUALS', 'NOT_EQUALS', 'LIKE', 'NOT_LIKE', 'IS_NULL', 'IS_NOT_NULL',],
    'NUMBER': ['EQUALS', 'NOT_EQUALS', 'GREATER', 'GREATER_EQUALS', 'LESS', 'LESS_EQUALS', 'IS_NULL', 'IS_NOT_NULL',],
    'BOOLEAN': ['IN_LIST', 'NOT_IN_LIST',],
    'DATE': ['EQUALS', 'NOT_EQUALS', 'GREATER', 'GREATER_EQUALS', 'LESS', 'LESS_EQUALS', 'IS_NULL', 'IS_NOT_NULL',],
    'AMOUNT': ['CURRENCY_IN_LIST', 'CURRENCY_NOT_IN_LIST', 'AMOUNT_EQUALS', 'AMOUNT_NOT_EQUALS', 'AMOUNT_GREATER', 'AMOUNT_GREATER_EQUALS', 'AMOUNT_LESS', 'AMOUNT_LESS_EQUALS',],
    'ENUM': ['IN_LIST', 'NOT_IN_LIST',],
    'REFERENCE': ['IN_LIST', 'NOT_IN_LIST',],
    'JSON': [],
  }
  private references: { [key: string]: Reference[] } = {}

  fields: EntityField[] = []
  expression!: InternalEntityFilterExpression

  constructor(
    private dialogRef: MatDialogRef<EntityFilterExpressionComponent>,
    @Inject(MAT_DIALOG_DATA) data: EntityFilterExpressionDialogData,
    private entityService: EntityService,
    private currencyService: CurrencyService,
  ) {
    this.fields = data.fields
    this.expression = {
      id: data.expression.id,
      field: this.fields.find(field => field.name == data.expression.field)!,
      operator: data.expression.operator,
      value: data.expression.value,
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

  async getReferences(): Promise<Reference[]> {
    let entity = this.expression.field.referenceName!
    if (this.references[entity]) {
      return new Promise<Reference[]>(() => {
        return this.references[entity]
      })
    } else {
      return lastValueFrom(this.entityService.referenceList(entity))
        .then((result) => {
          this.references[entity] = result
          return result
        })
    }
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
      || (this.expression.operator != 'IS_NULL' && this.expression.operator != 'IS_NOT_NULL')
  }

  isMultiselectInput(): boolean {
    return this.expression.field.type == 'REFERENCE'
      || this.expression.field.type == 'ENUM'
      || this.expression.field.type == 'BOOLEAN'
      || (this.expression.field.type == 'AMOUNT'
        && (this.expression.operator == 'CURRENCY_IN_LIST' || this.expression.operator == 'CURRENCY_NOT_IN_LIST')
      )
  }

  isDateInput(): boolean {
    return this.expression.field.type == 'DATE' && (
      this.expression.operator == 'EQUALS'
      || this.expression.operator == 'NOT_EQUALS'
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
        || this.expression.operator == 'NOT_EQUALS'
        || this.expression.operator == 'GREATER'
        || this.expression.operator == 'GREATER_EQUALS'
        || this.expression.operator == 'LESS'
        || this.expression.operator == 'LESS_EQUALS'
      )
    ) || (
      this.expression.field.type == 'AMOUNT' && (
        this.expression.operator == 'EQUALS'
        || this.expression.operator == 'NOT_EQUALS'
        || this.expression.operator == 'GREATER'
        || this.expression.operator == 'GREATER_EQUALS'
        || this.expression.operator == 'LESS'
        || this.expression.operator == 'LESS_EQUALS'
      )
    )
  }

  protected readonly OPERATOR_LABELS = OPERATOR_LABELS;
}

interface InternalEntityFilterOperator {
  operator: EntityFilterOperator,
  label: string
}

export interface InternalEntityFilterExpression {
  id: number,
  field: EntityField,
  operator: EntityFilterOperator,
  value: any
}

import { Component, Inject, OnInit } from "@angular/core";
import {
  EntityField, EntityFieldType,
  EntityFilterExpression,
  EntityFilterDialogData, EntityFilterOperator,
} from "../../model/entity";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Reference } from "../../../common/model/reference";
import { EntityService } from "../../service/entity.service";
import { lastValueFrom } from "rxjs";
import { CurrencyService } from "../../../reference/service/currency.service";
import { Currency } from "../../../reference/model/currency";
import { AdaptiveService } from "../../../common/service/adaptive.service";

@Component({
  selector: 'entity-filter',
  templateUrl: 'entity-filter.component.html',
  styleUrls: ['entity-filter.component.scss']
})
export class EntityFilterComponent implements OnInit {

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
  private operators: InternalEntityFilterOperator[] = [
    { operator: 'EQUALS', label: 'equals...' },
    { operator: 'NOT_EQUALS', label: 'not equals...' },
    { operator: 'GREATER', label: 'greater....' },
    { operator: 'GREATER_EQUALS', label: 'greater or equals...' },
    { operator: 'LESS', label: 'less than...' },
    { operator: 'LESS_EQUALS', label: 'less or equals...' },
    { operator: 'LIKE', label: 'like...' },
    { operator: 'NOT_LIKE', label: 'not like...' },
    { operator: 'IN_LIST', label: 'in list...' },
    { operator: 'NOT_IN_LIST', label: 'not in list...' },
    { operator: 'IS_NULL', label: 'is null' },
    { operator: 'IS_NOT_NULL', label: 'is not null' },
    { operator: 'CURRENCY_IN_LIST', label: 'currency in list...' },
    { operator: 'CURRENCY_NOT_IN_LIST', label: 'currency not in list...' },
    { operator: 'AMOUNT_EQUALS', label: 'amount equals...' },
    { operator: 'AMOUNT_NOT_EQUALS', label: 'amount not equals...' },
    { operator: 'AMOUNT_GREATER', label: 'amount greater...' },
    { operator: 'AMOUNT_GREATER_EQUALS', label: 'amount greater equals...' },
    { operator: 'AMOUNT_LESS', label: 'amount less...' },
    { operator: 'AMOUNT_LESS_EQUALS', label: 'amount less or equals...' },
  ]
  private references: { [key: string]: Reference[] } = {}

  fields: EntityField[] = []
  conditions: InternalEntityFilterCondition[] = []

  constructor(
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) data: EntityFilterDialogData,
    private entityService: EntityService,
    private currencyService: CurrencyService,
    private adaptiveService: AdaptiveService
  ) {
    this.fields = data.fields
    this.conditions = data.conditions
      .map(condition => {
        return {
          id: condition.id,
          field: this.fields.find(field => field.name === condition.field)!,
          operator: condition.operator,
          value: condition.value
        }
      })
      .filter(condition => condition.field.type != 'JSON')
  }

  ngOnInit(): void {
    if (this.adaptiveService.desktop) {
      this.dialogRef.updateSize('700px', '500px')
    } else {
      this.dialogRef.updateSize('90vw', '85vh')
    }
  }

  result(): EntityFilterExpression[] {
    return this.conditions
      .filter(condition => condition.field != null)
      .map(condition => {
        return {
          id: condition.id,
          field: condition.field.name,
          operator: condition.operator,
          value: condition.value
        }
      })
  }

  getOperators(fieldType: EntityFieldType): InternalEntityFilterOperator[] {
    return this.operators.filter(operator => this.config[fieldType].includes(operator.operator))
  }

  async getReferences(entity: string): Promise<Reference[]> {
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

  isValueInputVisible(condition: InternalEntityFilterCondition): boolean {
    if (!condition.operator) {
      return false
    }
    return condition.field.type == 'REFERENCE'
      || condition.field.type == 'ENUM'
      || condition.field.type == 'BOOLEAN'
      || (condition.operator != 'IS_NULL' && condition.operator != 'IS_NOT_NULL')
  }

  isMultiselectInput(condition: InternalEntityFilterCondition): boolean {
    return condition.field.type == 'REFERENCE'
      || condition.field.type == 'ENUM'
      || condition.field.type == 'BOOLEAN'
      || (condition.field.type == 'AMOUNT'
        && (condition.operator == 'CURRENCY_IN_LIST' || condition.operator == 'CURRENCY_NOT_IN_LIST')
      )
  }

  isDateInput(condition: InternalEntityFilterCondition): boolean {
    return condition.field.type == 'DATE' && (
      condition.operator == 'EQUALS'
      || condition.operator == 'NOT_EQUALS'
      || condition.operator == 'GREATER'
      || condition.operator == 'GREATER_EQUALS'
      || condition.operator == 'LESS'
      || condition.operator == 'LESS_EQUALS'
    )
  }

  isNumberInput(condition: InternalEntityFilterCondition): boolean {
    return (
      condition.field.type == 'NUMBER' && (
        condition.operator == 'EQUALS'
        || condition.operator == 'NOT_EQUALS'
        || condition.operator == 'GREATER'
        || condition.operator == 'GREATER_EQUALS'
        || condition.operator == 'LESS'
        || condition.operator == 'LESS_EQUALS'
      )
    ) || (
      condition.field.type == 'AMOUNT' && (
        condition.operator == 'EQUALS'
        || condition.operator == 'NOT_EQUALS'
        || condition.operator == 'GREATER'
        || condition.operator == 'GREATER_EQUALS'
        || condition.operator == 'LESS'
        || condition.operator == 'LESS_EQUALS'
      )
    )
  }

  add() {
    this.conditions.push({
      id: Math.random(),
      negate: false,
      field: null,
      operator: null,
      empty: false,
      value: null
    } as any)
  }

  remove(condition: InternalEntityFilterCondition) {
    let index = this.conditions.indexOf(condition)
    this.conditions.splice(index, 1)
  }

}

interface InternalEntityFilterOperator {
  operator: EntityFilterOperator,
  label: string
}

interface InternalEntityFilterCondition {
  id: number,
  field: EntityField,
  operator: EntityFilterOperator,
  value: any
}

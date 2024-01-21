import { Operation } from "../../operation/model/operation";
import { Amount } from "../../common/model/amount";

export interface Income {
  selected: boolean,
  operation: Operation,
  amount: Amount | null,
}

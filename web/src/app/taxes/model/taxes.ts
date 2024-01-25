import { Operation } from "../../operation/model/operation";
import { Amount } from "../../common/model/amount";

export interface Income {
  operation: Operation,
  amount: Amount
}

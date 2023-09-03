import {Reference} from "../../common/model/reference";
import {Account} from "../../reference/model/account";

export interface CategoryMappingPage {
  total: number
  page: number
  size: number
  mappings: CategoryMapping[]
}

export interface CategoryMapping {
  id: string | null
  parser: Reference
  pattern: string
  category: Account
}

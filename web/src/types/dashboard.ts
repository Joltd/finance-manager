import { Amount } from "@/types/common";

export interface DashboardRecord {
  defaultCurrencyAmount: Amount;
  usdCashAmount: Amount | null;
  cashFounds: Amount[];
}
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { PricingItem } from "../model/pricing-item";
import { PricingOrderDefaults } from "../model/pricing-order";

@Injectable({
  providedIn: 'root'
})
export class PricingService {

  constructor(private http: HttpClient) {}

  searchItems(query: string): Observable<PricingItem[]> {
    return this.http.get<PricingItem[]>(`/pricing/item/top?query=${query}`)
  }

  orderDefaults(): Observable<PricingOrderDefaults> {
    return this.http.get<PricingOrderDefaults>('/pricing/order/defaults')
  }

  createOrder(order: any): Observable<void> {
    return this.http.post<void>('/pricing/order', order)
  }

}

import { Injectable } from "@angular/core";
import { HttpClient, HttpContext } from "@angular/common/http";
import { Observable } from "rxjs";
import { PricingItem } from "../model/pricing-item";
import { PricingOrderDefaults } from "../model/pricing-order";
import { SKIP_LOADING } from "../../common/service/rest-interceptor.service";

@Injectable({
  providedIn: 'root'
})
export class PricingService {

  constructor(private http: HttpClient) {}

  searchItems(query: string): Observable<PricingItem[]> {
    let context = new HttpContext()
    context.set(SKIP_LOADING, true)
    return this.http.get<PricingItem[]>(`/pricing/item/top?query=${query}`, { context})
  }

  orderDefaults(): Observable<PricingOrderDefaults> {
    return this.http.get<PricingOrderDefaults>('/pricing/order/defaults')
  }

  createOrder(order: any): Observable<void> {
    return this.http.post<void>('/pricing/order', order)
  }

}

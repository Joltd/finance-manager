import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Observable } from "rxjs";
import { EventEmitter } from "@angular/core";

export class EntityDataSource implements DataSource<any> {

  private dataProvider = new EventEmitter<any[]>()

  setData(data: any[]) {
    this.dataProvider.emit(data)
  }

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.dataProvider.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.dataProvider.unsubscribe()
  }

}

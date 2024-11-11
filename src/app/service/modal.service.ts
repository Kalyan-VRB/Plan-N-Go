import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private modalStates = new Map<string, boolean>();
  private modalSubject = new BehaviorSubject<Map<string, boolean>>(this.modalStates);
  modalState$ = this.modalSubject.asObservable();

  show(id: string): void {
    this.modalStates.set(id, true);
    this.modalSubject.next(this.modalStates);
  }

  hide(id: string): void {
    this.modalStates.set(id, false);
    this.modalSubject.next(this.modalStates);

  }

  getModalState(id: string): Observable<boolean> {
    return this.modalState$.pipe(
      map(states => states.get(id) || false)
    );
  }
}

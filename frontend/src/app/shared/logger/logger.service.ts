import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LoggerService {

  private logged: string;
  private subject: Subject<string> = new Subject<string>();

  setLogged(logged: string): void {
    this.logged = logged;
    this.subject.next(logged);
  }
  
  getLogged(): Observable<String> {
    return this.subject.asObservable();
  }
}
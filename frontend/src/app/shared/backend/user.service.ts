import { Injectable }       from "@angular/core";
import { BehaviorSubject }  from "rxjs";
import { BackendService } from './backend.service';

@Injectable()
export class UserService {
    user: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(private backend: BackendService) {
        this.getUser();
    }

    getUser(): void {
        this.backend.getUser()
            .then(res => {
                if (res.result && res.data) {
                    this.user.next(res.data);
                }
            })
            .catch(error => console.log('ERROR: ', error))
    }
}

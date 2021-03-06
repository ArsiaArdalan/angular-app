import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Subject } from 'rxjs/rx';
import { AuthService } from './auth.service';
import 'rxjs/add/operator/map';


@Injectable()
/**
 * privides services to the messages component -- decoupling UI and services
 */
export class WebService {
    BASE_URL = 'http://localhost:3000/api';
    private messageStore = [];
    private messageSubject = new Subject();
    messages = this.messageSubject.asObservable();

    constructor(private http: Http, private sb: MatSnackBar, private authService: AuthService){
        // it's guaranteed that by the time we are calling our service, we have a response back
        // from getMessages(), we don't have to wait for another component to initially trigger it.
        this.getMessages(name);
    }
    /**
     * returns msgs once we get them via HTTP call
     * we need access to the angular HTTP service
     * To use the Http, we will need to have it injected into the class constructor
     */
    getMessages(user) {
            user = user ? '/' + user : '';
            var response = this.http.get( this.BASE_URL + '/messages' + user).subscribe(res => {
                this.messageStore = res.json();
                this.messageSubject.next(this.messageStore);
            }, error => {
                this.handleError('Unable to get messages');
            });

    }

    getUser(){
        return this.http.get(this.BASE_URL + '/users/me', this.authService.tokenHeader).map(res => res.json());
    }
    async postMessage(newMessage) {
        try {
            var response = await this.http.post( this.BASE_URL + '/messages', newMessage).toPromise();
            this.messageStore.push(response.json());
            this.messageSubject.next(this.messageStore);

        } catch (error) {
            this.handleError('Unable to post a message');
        }
    }

    async deleteAllMessages() {
        var response = await this.http.delete( this.BASE_URL + '/delete').subscribe(res => {
            this.messageStore = [];
            this.messageSubject.next(this.messageStore);
        }, errpr => {
            //TODO: due to routing (that it renders the HomeComponent) we are showing the error message twice.
            this.handleError('Unable to delete messages');
        });
    }

    private handleError(error) {
        console.error(error);
        this.sb.open(error, 'close', {duration: 4000} );
    }
}

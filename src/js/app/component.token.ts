import '@angular/core'

import {Component} from '@angular/core'
import {Router} from '@angular/router'
import {SignaturitService} from './service.signaturit'

const {dialog} = require('electron').remote;

@Component({
    selector: 'token',
    templateUrl: '../views/component.token.html',
    styleUrls: ['../css/component.token.css']
})

export class TokenComponent {
    token: string;
    environment: string;
    loading: boolean = false;

    constructor(private router: Router, private signaturitService: SignaturitService) {
        this.token = localStorage.getItem('token');

        if (!this.token) {
            this.token = ''
        }

        this.environment = localStorage.getItem('environment');

        if (!this.environment) {
            this.environment = 'production'
        }
    }

    submit() {
        localStorage.setItem('token', this.token);
        localStorage.setItem('environment', this.environment);

        let token      = this.token;
        let production = this.environment == 'production';

        this.loading = true;

        this.signaturitService.checkAccessToken(
            token,
            production,
            () => this.router.navigate(['users']).then(null),
            response => {
                if (response.error == 'no_admin') {
                    dialog.showErrorBox('Connection error (ERR000)', 'The token is not from an admin user.')
                } else {
                    dialog.showErrorBox('Connection error (ERR003)', 'It seems that you are having some issue with your internet connection. Please, close the app and try again later.')
                }
            })
    }
}

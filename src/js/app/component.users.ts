import '@angular/core'

import {Component, NgZone} from '@angular/core'
import {Router} from '@angular/router'
import {SignaturitService} from './service.signaturit'

import {User} from './model.user'

const {dialog} = require('electron').remote;

@Component({
    selector: 'users',
    templateUrl: '../views/component.users.html',
    styleUrls: ['../css/component.users.css']
})

export class UsersComponent {
    users: Array<User> = [];
    loading: boolean   = false;

    constructor(private zone: NgZone, private router: Router, private signaturitService: SignaturitService) {
        this.init()
    }

    public numUsersSelected(): number {
        let num = 0;

        for (let user of this.users) {
            if (user.selected) {
                num++
            }
        }

        return num
    }

    public selectAll(event) {
        event.preventDefault();

        this.zone.run(() => {
            for (let user of this.users) {
                user.selected = true
            }
        })
    }

    public selectNone(event) {
        event.preventDefault();

        this.zone.run(() => {
            for (let user of this.users) {
                user.selected = false
            }
        })
    }

    public submit() {
        let ids = this.users
            .filter(user => user.selected)
            .map(user => user.id);

        dialog.showOpenDialog(
            {buttonLabel: 'Descargar', properties: ['openDirectory', 'createDirectory']},
            path => {
                if (path) {
                    this.router.navigate(['files', {path: path, users: ids}]).then(null)
                }
            }
        )
    }

    private init() {
        let token      = localStorage.getItem('token');
        let production = localStorage.getItem('environment') == 'production';

        this.loading = true;

        this.signaturitService.getUsers(
            token,
            production,
            users => {
                this.zone.run(() => {
                    this.users = users;

                    this.loading = false
                })
            },
            () => dialog.showErrorBox('Connection error (ERR004)', 'It seems that you are having some issue with your internet connection. Please, close the app and try again later.')
        )
    }
}

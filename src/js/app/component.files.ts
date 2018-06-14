import '@angular/core'

import {Component, NgZone} from '@angular/core'
import {ActivatedRoute, Router} from '@angular/router'
import {SignaturitService} from './service.signaturit'

import {File} from './model.file'
import {User} from './model.user'

const {dialog} = require('electron').remote;

@Component({
    selector: 'files',
    templateUrl: '../views/component.files.html',
    styleUrls: ['../css/component.files.css']
})

export class FilesComponent {
    path: string;
    loading: boolean        = false;
    users: Array<User>      = [];
    files: Array<File>      = [];
    downloaded: Array<File> = [];
    stats: string           = '';

    constructor(private zone: NgZone, private router: Router, private route: ActivatedRoute, private signaturitService: SignaturitService) {
        route.params.subscribe(params => {
            this.init(params)
        })
    }

    private init(params: Object) {
        let token      = localStorage.getItem('token');
        let production = localStorage.getItem('environment') == 'production';

        this.loading = true;

        this.path = params['path'];
        let ids   = params['users'].split(',');

        this.signaturitService.getUsers(
            token,
            production,
            users => {
                this.users = users
                    .filter(
                        user => ids.indexOf(user.id) >= 0
                    )
                    .map(
                        user => new User(user.token, production, user.id, user.email, user.name)
                    );

                this.getFiles()
            },
            () => dialog.showErrorBox('Connection error (ERR001)', 'It seems that you are having some issue with your internet connection. Please, close the app and try again later.')
        )
    }

    private getFiles() {
        let fn = (index: number) => {
            if (index == this.users.length) {
                this.zone.run(() => this.loading = false);

                this.downloadFiles()
            } else {
                let user = this.users[index];

                this.signaturitService.getSignedFiles(
                    user,
                    files => {
                        Array.prototype.push.apply(this.files, files);

                        fn(index + 1)
                    },
                    () => dialog.showErrorBox('Connection error (ERR002)', 'It seems that you are having some issue with your internet connection. Please, close the app and try again later.')
                )
            }
        };

        fn(0)
    }

    private downloadFiles() {
        let fn = (index: number) => {
            if (this.files.length > index) {
                let file = this.files[index];

                this.zone.run(() => {
                    file.status = 'downloading';

                    this.downloaded.unshift(file)
                });

                this.signaturitService.downloadFile(
                    file,
                    this.path,
                    (response, isNewFile) => {
                        this.zone.run(() => {
                            if (isNewFile) {
                                file.status = 'downloaded'
                            } else {
                                file.status = 'skipped'
                            }
                        });

                        fn(index + 1)
                    },
                    () => {
                        file.status = 'error';

                        fn(index + 1)
                    }
                )
            } else {
                let error      = this.downloaded.filter(file => file.status == 'error').length;
                let skipped    = this.downloaded.filter(file => file.status == 'skipped').length;
                let downloaded = this.downloaded.length - error - skipped;

                this.zone.run(
                    () => this.stats = `${downloaded} files downloaded, ${skipped} ignored, ${error} errors`
                )
            }
        };

        fn(0)
    }
}

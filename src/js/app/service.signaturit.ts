import {Injectable} from '@angular/core'

import {File} from './model.file'
import {User} from './model.user'

import * as SignaturitClient from 'signaturit-sdk'

const fs   = require('fs-extra');
const path = require('path');

@Injectable()
export class SignaturitService {
    public checkAccessToken(token: string, production: boolean, fnSuccess, fnError) {
        let client = new SignaturitClient(token, production);

        return client.getUsers().then(
            users => {
                if (users[0].token) {
                    fnSuccess()
                } else {
                    fnError({error: 'no_admin'})
                }
            },
            response => fnError(response)
        )
    }

    public getUsers(token: string, production: boolean, fnSuccess, fnError) {
        let client = new SignaturitClient(token, production);

        let data: Array<User> = [];

        client.getUsers().then(
            response => {
                for (let obj of response) {
                    data.push(
                        new User(obj.token, production, obj.id, obj.email, obj.name)
                    )
                }

                fnSuccess(data)
            },
            response => fnError(response)
        )
    }

    public getSignedFiles(user: User, fnSuccess, fnError) {
        let client = new SignaturitClient(user.token, user.production);

        let data: Array<Object> = [];

        let limit  = 100;
        let offset = 0;

        let fn = () => {
            client.getSignatures(limit, offset, {status: 'completed'}).then(
                response => {
                    for (let signature of response) {
                        let fileIds = [];

                        for (let document of signature.documents) {
                            const fileId = `${document.file.name}|${document.file.pages}|${document.file.size}`;

                            if (fileIds.indexOf(fileId) == -1) {
                                fileIds.push(fileId);

                                data.push(
                                    new File(user, signature, document)
                                )
                            }
                        }
                    }

                    offset += limit;

                    if (response.length > 0) {
                        fn()
                    } else {
                        fnSuccess(data)
                    }
                },
                response => fnError(response)
            )
        };

        fn()
    }

    public downloadFile(file: File, basePath: string, fnSuccess, fnError) {
        let client = new SignaturitClient(file.user.token, file.user.production);

        const filePath = `${basePath}/${file.location}`;

        if (fs.existsSync(filePath)) {
            fnSuccess(filePath, false)
        } else {
            client.downloadSignedDocument(file.signature.id, file.document.id).then(
                response => {
                    const dir = path.dirname(filePath);

                    fs.ensureDir(dir, error => {
                        if (error) {
                            fnError(error)
                        } else {
                            const stream = fs.createWriteStream(filePath);

                            stream.write(response);

                            stream.on('error', error => {
                                fnError(error)
                            });

                            stream.end(() => {
                                fnSuccess(filePath, true)
                            })
                        }
                    })

                },
                response => fnError(response)
            )
        }
    }
}
